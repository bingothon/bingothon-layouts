import { Board, Cell, Player, RoomAction, ServerMessage } from '@playbingo/types';
import { Bingoboard } from 'schemas/bingoboard';
import WebSocket from 'ws';
import * as nodecgApiContext from './util/nodecg-api-context';
import { BingoboardCell } from 'types';
import { boardRep, playBingoSocketRep } from './util/replicants';

const nodecg = nodecgApiContext.get();

const log = new nodecg.Logger(`${nodecg.bundleName}:playbingo`);

const playBingoHost = 'https://playbingo.gg';
const socketHost = playBingoHost.replace('http', 'ws');

playBingoSocketRep.value.status = 'disconnected';

log.info('Setting up PlayBingo integration');

let webSocket: WebSocket;
let players: Player[] = [];

const parseCell = (cell: Cell, row: number, col: number): BingoboardCell => ({
    name: cell.revealed ? cell.goal.goal : '',
    slot: `${row * 5 + col}`,
    colors: cell.completedPlayers.map((playerId) => players.find((player) => player.id === playerId)?.color ?? ''),
    rawColors: cell.completedPlayers.map((playerId) => players.find((player) => player.id === playerId)?.color).join(' '),
    markers: [null, null, null, null]
});

const parseBoard = (board: Board): Bingoboard => {
    if (board.hidden) {
        return { colorCounts: {}, cells: [] };
    }
    return {
        colorCounts: {},
        cells: board.board.map((row, rowIndex) => row.map((cell, index) => parseCell(cell, rowIndex, index)))
    };
};

nodecg.listenFor('playBingo:connect', async (data, callback) => {
    playBingoSocketRep.value.status = 'connecting';
    const { slug, passphrase } = data;
    log.info(`Connecting to PlayBingo room ${data.slug}:${data.passphrase}`);
    try {
        const res = await fetch(`${playBingoHost}/api/rooms/${slug}/authorize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: passphrase, spectator: true })
        });

        if (!res.ok) {
            playBingoSocketRep.value.status = 'error';
            if (res.status < 500) {
                log.error(`Failed to join room ${slug} - ${res.status} ${await res.text()}`);
                if (callback && !callback.handled) {
                    callback(new Error('Invalid room slug or password'));
                }
            } else {
                log.error(`Encountered a server error while joining room ${slug}`);
                if (callback && !callback.handled) {
                    callback(new Error('Unable to connect to PlayBingo'));
                }
            }
            return;
        }

        log.info(`Authorized to connect to PlayBingo room ${slug}`);
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
            if (data.players) {
                players = data.players;
            }
            switch (data.action) {
                case 'connected':
                    log.info('Successfully connected to room');
                    playBingoSocketRep.value.status = 'connected';
                    webSocket.send(JSON.stringify({ action: 'revealCard', authToken } as RoomAction));
                case 'syncBoard':
                    boardRep.value = parseBoard(data.board);
                    data.players?.forEach((player) => {
                        // TODO: we should map players in the schedule to
                        // players in the room to avoid needing this easily
                        // broken check
                        if (!player.spectator) {
                            boardRep.value.colorCounts[player.color] = player.goalCount;
                        }
                    });
                    break;
                case 'cellUpdate':
                    boardRep.value.cells[data.row][data.col] = parseCell(data.cell, data.row, data.col);
                    data.players?.forEach((player) => {
                        // TODO: we should map players in the schedule to
                        // players in the room to avoid needing this easily
                        // broken check
                        if (!player.spectator) {
                            boardRep.value.colorCounts[player.color] = player.goalCount;
                        }
                    });
                    break;
                default:
                    break;
            }
        });

        webSocket.on('close', (code, reason) => {
            playBingoSocketRep.value.status = 'disconnected';
            log.info(`PlayBingo socket connection closed ${code}: ${reason.toString()}`);
        });
    } catch (e) {
        console.log(e);
    }

    if (callback && !callback.handled) {
        callback(null);
    }
});

nodecg.listenFor('playBingo:disconnect', (callback) => {
    log.info('Closing PlayBingo connection');
    webSocket?.close();

    if (callback && !callback.handled) {
        callback(null);
    }
});
