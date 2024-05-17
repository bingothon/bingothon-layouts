import { Board, ServerMessage } from '@bingogg/types';
import { Bingoboard } from 'schemas/bingoboard';
import { BingoboardMeta } from 'schemas/bingoboardMeta';
import { BingoggSocket } from 'schemas/bingoggSocket';
import WebSocket from 'ws';
import * as nodecgApiContext from './util/nodecg-api-context';

const nodecg = nodecgApiContext.get();

const log = new nodecg.Logger(`${nodecg.bundleName}:bingogg`);

const bingoggHost = 'http://localhost:8001';
const socketHost = bingoggHost.replace('http', 'ws');

const boardRep = nodecg.Replicant<Bingoboard>('bingoboard');
const boardMetaRep = nodecg.Replicant<BingoboardMeta>('bingoboardMeta');
const socketRep = nodecg.Replicant<BingoggSocket>('bingoggSocket');
socketRep.value.status = 'disconnected';

log.info('setting up bingogg integration');

let webSocket: WebSocket;

const parseBoard = (board: Board): Bingoboard => {
    return {
        colorCounts: {},
        cells: board.board.flatMap((row, rowIndex) =>
            row.map((cell, index) => {
                return {
                    name: cell.goal,
                    slot: `${rowIndex * 5 + index}`,
                    colors: ['red'],
                    rawColors: cell.colors.join(' '),
                    markers: [null, null, null, null],
                };
            }),
        ),
    };
};

nodecg.listenFor('bingogg:connect', async (data, callback) => {
    const { slug, passphrase } = data;
    log.info(`connecting to bingogg room ${data.slug}:${data.passphrase}`);
    const res = await fetch(`${bingoggHost}/api/rooms/${slug}/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passphrase }),
    });

    if (!res.ok) {
        if (res.status < 500) {
            log.error(`Failed to join room ${slug} - ${res.status} ${await res.text()}`);
            if (callback && !callback.handled) {
                callback(new Error('Invalid room slug or password'));
            }
        } else {
            log.error(`Encountered a server error while joining room ${slug}`);
            if (callback && !callback.handled) {
                callback(new Error('Unable to connect to bingo.gg'));
            }
        }
        return;
    }

    log.info(`Authorized to connect to bingo.gg room ${slug}`);
    const { authToken } = await res.json();

    try {
        if (webSocket) {
            webSocket.close();
        }
        webSocket = new WebSocket(`${socketHost}/socket/${slug}`);

        webSocket.once('open', () => {
            webSocket.send(
                JSON.stringify({
                    action: 'join',
                    authToken,
                    payload: { nickname: 'bingothon' },
                }),
            );
        });

        webSocket.on('message', (message) => {
            const data: ServerMessage = JSON.parse(message.toString());
            console.log(data);
            switch (data.action) {
                case 'connected':
                case 'syncBoard':
                    boardRep.value = parseBoard(data.board);
                    break;
                default:
                    break;
            }
        });
    } catch (e) {
        console.log(e);
    }

    if (callback && !callback.handled) {
        callback(null);
    }
});
