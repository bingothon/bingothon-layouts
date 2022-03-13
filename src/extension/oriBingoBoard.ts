import * as RequestPromise from 'request-promise';

import * as nodecgApiContext from './util/nodecg-api-context';
import {OriBingoboard, OriBingoMeta, BingoboardMeta} from '../../schemas';
import { BoardColor, ExplorationBingoboardCell } from '../../types';

const nodecg = nodecgApiContext.get();
const log = new nodecg.Logger(`${nodecg.bundleName}:oriBingo`);
const request = RequestPromise.defaults({jar: true});
const boardRep = nodecg.Replicant<OriBingoboard>('oriBingoboard');
const boardMetaRep = nodecg.Replicant<BingoboardMeta>('bingoboardMeta');
// TEST: boardID: 4235, playerID:221
const oriBingoMeta = nodecg.Replicant<OriBingoMeta>('oriBingoMeta');

const emphasisRegex = /\*([^*]+)\*/;

let oldBoard: ExplorationOriField[] | null = null;
let updateLoopTimer: NodeJS.Timer | null = null;

interface OriField {
    name: string;
    completed: boolean;
}

// used to track last state
interface ExplorationOriField {
    name: string;
    completed: boolean;
    revealed: boolean;
}

interface OriApiResponse {
    cards: OriField[], // length 25
    disc_squares: number[],
}

function processStyling(goalName: string): string {
    while (goalName.includes('*')) {
        // eslint-disable-next-line no-param-reassign
        goalName = goalName.replace(emphasisRegex, '<span class="underline">$1</span>');
    }
    return goalName;
}

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve): number => setTimeout(resolve, ms));
}

async function getBoards(game: string, boardID: number, playerID: string): Promise<OriApiResponse[]> {
    const playerIDs = playerID.split(',');
    if (playerIDs.length === 0) {
        throw new Error("no player ids!");
    }
    return Promise.all(playerIDs.map(id => {
        if (game === 'ori2') {
            return request.get(`https://wotw.orirando.com/api/bingothon/latest/${id.trim()}`, {json: true});
        } else {
            return request.get(`https://orirando.com/bingo/bingothon/${boardID}/player/${id.trim()}`, {json: true});
        }
    }));
}

function init(): void {
    if (boardRep.value.cells.length === 0) {
        for (let i = 0; i < 25; i += 1) {
            boardRep.value.cells.push({name: '', hidden: true, hiddenName: '', colors: 'blank', slot: `slot${i}`});
        }
    }
}

function toBingosyncBoard(resp: OriApiResponse[], color: string): {cells: ExplorationBingoboardCell[], count: number} {
    if (resp.length === 0) {
        throw new Error("need a board pls");
    }
    const completed: boolean[] = new Array(25).fill(false);
    resp.forEach(c => {
        c.cards.forEach((square, index) => {
            if (square.completed) {
                completed[index] = true;
            }
        });
    });
    const current = new Set<number>();
    resp.forEach(r => {
        r.disc_squares.forEach((square) => {
            current.add(square);
        });
    });
    let lastSize = 0;
    while (current.size !== lastSize) {
        lastSize = current.size
        current.forEach((square) => {
            if (completed[square]) {
                if (square % 5 > 0)
                    current.add(square - 1)
                if (square % 5 < 4)
                    current.add(square + 1)
                current.add(square - 5)
                current.add(square + 5)
            }
        });
    }
    let goalCounts = 0;
    const cells = resp[0].cards.map((card, index) => {
        const revealed = current.has(index);
        const processedName = processStyling(card.name);
        const goalCompleted = revealed && completed[index];
        if (goalCompleted) {
            goalCounts++;
        }
        return {
            name: revealed ? processedName : '',
            hidden: !revealed,
            hiddenName: processedName,
            colors: goalCompleted ? color : 'blank',
            slot: `slot${index}`
        };
    });
    return {
        cells,
        count: goalCounts
    };
}

interface RevealedSquare {
    revealed: boolean,
    done: boolean,
}

function toRevealed(resp: OriApiResponse): RevealedSquare[] {
    const current = new Set<number>();
    resp.disc_squares.forEach((square) => {
        current.add(square);
    });
    let lastSize = 0;
    while (current.size !== lastSize) {
        lastSize = current.size
        current.forEach((square) => {
            if (resp.cards[square]?.completed) {
                if (square % 5 > 0)
                    current.add(square - 1)
                if (square % 5 < 4)
                    current.add(square + 1)
                current.add(square - 5)
                current.add(square + 5)
            }
        });
    }
    const cells = resp.cards.map((_, index) => {
        const revealed = current.has(index);
        const goalCompleted = revealed && resp.cards[index].completed;
        return {
            revealed,
            done: goalCompleted
        };
    });
    return cells;
}

async function oriBingoUpdate(): Promise<void> {
    try {
        // eslint-disable-next-line max-len
        // console.log('update')
        const responses = await getBoards(oriBingoMeta.value.game, oriBingoMeta.value.boardID, oriBingoMeta.value.playerID);
        if (oriBingoMeta.value.coop) {
            const playerColor = boardMetaRep.value.playerColors[0] || 'red';
            const {cells, count} = toBingosyncBoard(responses, playerColor);
            boardRep.value.cells = cells;
            boardRep.value.colorCounts[playerColor] = count;
        } else {
            // each piece represents the state for one player
            const boardPieces = responses.map(toRevealed);
            const cells: ExplorationBingoboardCell[] = [];
            const colorCounts: { [key: string]: number } = {
                pink: 0,
                red: 0,
                orange: 0,
                brown: 0,
                yellow: 0,
                green: 0,
                teal: 0,
                blue: 0,
                navy: 0,
                purple: 0,
            };
            for (let i = 0; i < 25; i++) {
                // show the goal name if any player revealed it
                const anyRevealed = boardPieces.some(piece => piece[i].revealed);
                const processedName = processStyling(responses[0].cards[i].name);
                const colors: string[] = [];
                // array of the player colors, failsafe if the original array isn't big enough for
                // some reason
                const playerColors = Array(boardPieces.length)
                    .fill(null)
                    .map((_, index) => boardMetaRep.value.playerColors[index] || 'red');
                // process the board for each player
                boardPieces.forEach((piece, index) => {
                    if (piece[i].done) {
                        colors.push(playerColors[index]);
                        colorCounts[playerColors[index]]++;
                    }
                })
                cells.push({
                    name: anyRevealed ? processedName : '',
                    hidden: !anyRevealed,
                    hiddenName: processedName,
                    colors: colors.join(' ') || 'blank',
                    slot: `slot${i}`
                });
            }
            boardRep.value.cells = cells;
            boardRep.value.colorCounts = colorCounts;

        }
    } catch (e) {
        log.error(e);
    }
}

// recover the room at server restart
function recover(): void {
    oriBingoMeta.once('change', async (newVal): Promise<void> => {
        if (!newVal.active) return;
        const {boardID} = newVal;
        const {playerID} = newVal;
        const {game} = newVal;
        try {
            await getBoards(game, boardID, playerID);
            updateLoopTimer = setInterval(oriBingoUpdate, 3000);
            log.info('Successfully recovered connection to Ori Board');
        } catch (e) {
            log.error('Can\'t recover connection to Ori Board!', e);
        }
    });
}

nodecg.listenFor('oriBingo:activate', async (data, callback): Promise<void> => {
    try {
        if (updateLoopTimer) {
            clearTimeout(updateLoopTimer);
        }
        // see if the board/player actually exists
        const boardID = parseInt(data.boardID, 10);
        console.log('activate')
        await getBoards(data.game, boardID, data.playerID);
        oriBingoMeta.value = {active: true, game: data.game, boardID, playerID: data.playerID, coop: data.coop};
        updateLoopTimer = setInterval(oriBingoUpdate, 3000);
        if (callback && !callback.handled) {
            callback();
        }
    } catch (error) {
        log.error(error);
        if (callback && !callback.handled) {
            callback(error);
        }
    }
});

nodecg.listenFor('oriBingo:deactivate', async (_data, callback): Promise<void> => {
    oriBingoMeta.value.active = false;
    if (updateLoopTimer) {
        clearInterval(updateLoopTimer);
    }
    if (callback && !callback.handled) {
        callback();
    }
});

init();
recover();
