import * as RequestPromise from 'request-promise';

import * as nodecgApiContext from './util/nodecg-api-context';
import {OriBingoboard, OriBingoMeta, BingoboardMeta} from '../../schemas';
import { ExplorationBingoboardCell } from '../../types';

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

async function getBoard(game: string, boardID: number, playerID: string): Promise<OriApiResponse> {
    if (game === 'ori2') {
        return request.get(`https://wotw.orirando.com/api/bingothon/latest/${playerID}`, {json: true});
    }
    return request.get(`https://orirando.com/bingo/bingothon/${boardID}/player/${playerID}`, {json: true});
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

async function oriBingoUpdate(): Promise<void> {
    try {
        // eslint-disable-next-line max-len
        // console.log('update')
        const responses = [await getBoard(oriBingoMeta.value.game, oriBingoMeta.value.boardID, oriBingoMeta.value.playerID)];
        if (oriBingoMeta.value.game === 'ori1') {
            responses.push(await getBoard(oriBingoMeta.value.game, oriBingoMeta.value.boardID, "2"));
        }
        const playerColor = boardMetaRep.value.playerColors[0] || 'red';
        const {cells, count} = toBingosyncBoard(responses, playerColor);
        boardRep.value.cells = cells;
        boardRep.value.colorCounts[playerColor] = count;
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
            await getBoard(game, boardID, playerID);
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
        await getBoard(data.game, boardID, data.playerID);
        oriBingoMeta.value = {active: true, game: data.game, boardID, playerID: data.playerID};
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
