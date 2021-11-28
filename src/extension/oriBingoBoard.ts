import * as RequestPromise from 'request-promise';

import * as nodecgApiContext from './util/nodecg-api-context';
import {OriBingoboard, OriBingoMeta, BingoboardMeta} from '../../schemas';

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

async function oriBingoUpdate(): Promise<void> {
    try {
        // eslint-disable-next-line max-len
        // console.log('update')
        const oriResp = await getBoard(oriBingoMeta.value.game, oriBingoMeta.value.boardID, oriBingoMeta.value.playerID);
        let oriResp2 : OriApiResponse;
        if (oriBingoMeta.value.game === 'ori1') {
            oriResp2 = await getBoard(oriBingoMeta.value.game, oriBingoMeta.value.boardID, "2");
        } else {
            oriResp2 = oriResp;
        }
        const oriBoard: OriField[] = oriResp.cards;
        const oriBoardRevealed: ExplorationOriField[] = [];
        const playerColor = boardMetaRep.value.playerColors[0] || 'red';
        let goalCount = 0;
        oriBoard.forEach((field, idx): void => {
            const shouldBeRevealed = squareShouldBeRevealed(oriResp, oriResp2, idx);
            const shouldBeRevealed2 = squareShouldBeRevealed(oriResp2, oriResp, idx)
            if (!oldBoard || oldBoard[idx].name !== field.name || oldBoard[idx].revealed !== shouldBeRevealed || oldBoard[idx].revealed !== shouldBeRevealed2) {
                if (shouldBeRevealed || shouldBeRevealed2) {
                    boardRep.value.cells[idx].name = processStyling(field.name);
                } else {
                    boardRep.value.cells[idx].name = '';
                }
            }
            if ((field.completed || oriResp2.cards[idx].completed) && (shouldBeRevealed || shouldBeRevealed2)) {
                boardRep.value.cells[idx].colors = playerColor;
                goalCount++;
            } else {
                boardRep.value.cells[idx].colors = 'blank';
            }
            oriBoardRevealed.push({name: field.name, completed: field.completed, revealed: shouldBeRevealed});
        });
        boardRep.value.colorCounts[playerColor] = goalCount;
        oldBoard = oriBoardRevealed;
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

function squareShouldBeRevealed(apiResp: OriApiResponse, apiResp2 : OriApiResponse, idx: number): boolean {
    let completed: Set<number> = new Set<number>();
    for (let i = 0; i < apiResp.cards.length; i++) {
        if (apiResp.cards[i].completed || apiResp2.cards[i].completed) {
            completed.add(i);
        }
    }
    let current = new Set<number>();
    apiResp.disc_squares.forEach((square) => {
        current.add(square)
    });
    let lastSize = 0;
    while (current.size != lastSize) {
        lastSize = current.size
        current.forEach((square) => {
            if (completed.has(square)) {
                if (square % 5 > 0)
                    current.add(square - 1)
                if (square % 5 < 4)
                    current.add(square + 1)
                current.add(square - 5)
                current.add(square + 5)
            }
        });
    }
    return current;
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
