import { Board, Cell, Player, RoomAction, ServerMessage } from '@playbingo/types';
import { Bingoboard } from 'schemas/bingoboard';
import WebSocket from 'ws';
import * as nodecgApiContext from './util/nodecg-api-context';
import { BingoboardCell } from 'types';
import { boardRep, playBingoSocketRep } from './util/replicants';
import { waitForReplicants } from './util/waitForReplicants';

const nodecg = nodecgApiContext.get();

const log = new nodecg.Logger(`${nodecg.bundleName}:playbingo`);

const playBingoHost = 'https://playbingo.gg';
const socketHost = playBingoHost.replace('http', 'ws');

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

function handlePlayerListUpdate(players: Player[] | undefined) {
    if (!players) return;
    players.forEach((player) => {
        // TODO: we should map players in the schedule to
        // players in the room to avoid needing this easily
        // broken check
        if (!player.spectator) {
            boardRep.value.colorCounts[player.color] = player.goalCount;
        }
    });
    playBingoSocketRep.value.playerColors = players.map((player) => ({ name: player.nickname, color: player.color }));
}

const PLAYBINGO_ROOM_RE = /.*playbingo\.gg\/rooms\/([^\/]+)\/?/;

nodecg.listenFor('playBingo:connect', async (data, callback) => {
    const { slug, passphrase }: { slug: string; passphrase: string } = data;
    try {
        await joinPlaybingoRoom(slug, passphrase);
    } catch (e) {
        log.error('playBingo:connect error', e);
        if (callback && !callback.handled) {
            callback(e);
        }
    }
    if (callback && !callback.handled) {
        callback(null);
    }
});

async function joinPlaybingoRoom(slug: string, passphrase: string) {
    playBingoSocketRep.value.status = 'connecting';
    const match = slug.match(PLAYBINGO_ROOM_RE);
    if (match?.[1]) {
        slug = match[1];
    }
    log.info(`Connecting to PlayBingo room ${slug}:${passphrase}`);
    try {
        const res = await fetch(`${playBingoHost}/api/rooms/${slug}/authorize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: passphrase, spectator: true })
        });

        if (!res.ok) {
            if (res.status < 500) {
                log.error(`Failed to join room ${slug} - ${res.status} ${await res.text()}`);
                throw new Error('Invalid room slug or password');
            } else {
                log.error(`Encountered a server error while joining room ${slug}`);
                throw new Error('Unable to connect to PlayBingo');
            }
        }

        playBingoSocketRep.value.passphrase = passphrase;
        playBingoSocketRep.value.roomCode = slug;
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
                    handlePlayerListUpdate(data.players);
                    break;
                case 'cellUpdate':
                    boardRep.value.cells[data.row][data.col] = parseCell(data.cell, data.row, data.col);
                    handlePlayerListUpdate(data.players);
                    break;
                case 'chat':
                case 'updateRoomData':
                    handlePlayerListUpdate(data.players);
                default:
                    break;
            }
        });

        webSocket.on('close', (code, reason) => {
            playBingoSocketRep.value.status = 'disconnected';
            log.info(`PlayBingo socket connection closed ${code}: ${reason.toString()}`);
        });
    } catch (e) {
        playBingoSocketRep.value.status = 'error';
        throw e;
    }
}

nodecg.listenFor('playBingo:disconnect', (callback) => {
    log.info('Closing PlayBingo connection');
    webSocket?.close();

    if (callback && !callback.handled) {
        callback(null);
    }
});

waitForReplicants([playBingoSocketRep], () => {
    // recovering past connection
    // catch startup errors when this is all empty
    if (!playBingoSocketRep.value || !playBingoSocketRep.value.roomCode || !playBingoSocketRep.value.passphrase) {
        if (!playBingoSocketRep.value) {
            playBingoSocketRep.value = { status: 'disconnected' };
            return;
        }
        playBingoSocketRep.value.status = 'disconnected';
    }
    // Restore previous connection on startup
    const { roomCode, passphrase, status } = playBingoSocketRep.value;
    if (roomCode && passphrase && status !== 'disconnected') {
        log.info(`Recovering connection to playbingo room ${roomCode}`);
        joinPlaybingoRoom(roomCode, passphrase)
            .then((): void => {
                log.info(`Successfully recovered connection to room ${roomCode}`);
            })
            .catch((e): void => {
                playBingoSocketRep.value.status = 'error';
                log.error(`Couldn't join room ${roomCode}`, e);
            });
    } else {
        playBingoSocketRep.value.status = 'disconnected';
    }
});
