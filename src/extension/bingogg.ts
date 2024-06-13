import { Board, Cell, ServerMessage } from '@bingogg/types';
import { Bingoboard } from 'schemas/bingoboard';
import WebSocket from 'ws';
import * as nodecgApiContext from './util/nodecg-api-context';
import { BingoboardCell } from 'types';
import { boardRep, bingoggSocketRep, socketRep } from './util/replicants';

const nodecg = nodecgApiContext.get();

const log = new nodecg.Logger(`${nodecg.bundleName}:bingogg`);

const bingoggHost = 'https://bingogg.bingothon.com';
const socketHost = bingoggHost.replace('http', 'ws');

bingoggSocketRep.value.status = 'disconnected';

log.info('setting up bingogg integration');

let webSocket: WebSocket;

const parseCell = (cell: Cell, row: number, col: number): BingoboardCell => ({
    name: cell.goal,
    slot: `${row * 5 + col}`,
    colors: cell.colors,
    rawColors: cell.colors.join(' '),
    markers: [null, null, null, null]
});

const parseBoard = (board: Board): Bingoboard => {
    return {
        colorCounts: {},
        cells: board.board.flatMap((row, rowIndex) => row.map((cell, index) => parseCell(cell, rowIndex, index)))
    };
};

nodecg.listenFor('bingogg:connect', async (data, callback) => {
    socketRep.value.status = 'connecting';
    const { slug, passphrase } = data;
    log.info(`connecting to bingogg room ${data.slug}:${data.passphrase}`);
    try {
        const res = await fetch(`${bingoggHost}/api/rooms/${slug}/authorize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: passphrase })
        });

        if (!res.ok) {
            socketRep.value.status = 'error';
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

        if (webSocket) {
            webSocket.close();
        }
        webSocket = new WebSocket(`${socketHost}/socket/${slug}`);

        webSocket.once('open', () => {
            webSocket.send(
                JSON.stringify({
                    action: 'join',
                    authToken,
                    payload: { nickname: 'bingothon' }
                })
            );
        });

        webSocket.on('message', (message) => {
            const data: ServerMessage = JSON.parse(message.toString());
            switch (data.action) {
                case 'connected':
                    log.info('Successfully connected to room');
                    bingoggSocketRep.value.status = 'connected';
                case 'syncBoard':
                    boardRep.value = parseBoard(data.board);
                    data.players?.forEach((player) => {
                        boardRep.value.colorCounts[player.color] = player.goalCount;
                    });
                    break;
                case 'cellUpdate':
                    boardRep.value.cells[data.row * 5 + data.col] = parseCell(data.cell, data.row, data.col);
                    data.players?.forEach((player) => {
                        boardRep.value.colorCounts[player.color] = player.goalCount;
                    });
                    break;
                default:
                    break;
            }
            console.log(boardRep.value);
        });

        webSocket.on('close', () => {
            bingoggSocketRep.value.status = 'disconnected';
        });
    } catch (e) {
        console.log(e);
    }

    if (callback && !callback.handled) {
        callback(null);
    }
});

nodecg.listenFor('bingogg:disconnect', (callback) => {
    log.info('Closing bingogg connection');
    webSocket.close();

    if (callback && !callback.handled) {
        callback(null);
    }
});
