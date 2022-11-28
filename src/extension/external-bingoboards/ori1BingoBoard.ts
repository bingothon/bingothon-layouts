import * as RequestPromise from 'request-promise';

import * as nodecgApiContext from '../util/nodecg-api-context';
import {ExternalBingoboard, BingoboardMeta, ExternalBingoboardMeta} from '../../../schemas';
import { BoardColor, ExplorationBingoboardCell } from '../../../types';
import { ExternalBingoboardManager } from '../externalBingoboards';
import { ReplicantBrowser, ReplicantServer } from 'nodecg/types/server';
import { clearInterval } from 'timers';

const nodecg = nodecgApiContext.get();
const log = new nodecg.Logger(`${nodecg.bundleName}:oriBingo`);
const request = RequestPromise.defaults({jar: true});
const boardMetaRep = nodecg.Replicant<BingoboardMeta>('bingoboardMeta');
// TEST: boardID: 4235, playerID:221

const emphasisRegex = /\*([^*]+)\*/;

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

async function getBoards(boardID: string, playerID: string): Promise<OriApiResponse[]> {
    const playerIDs = playerID.split(',');
    if (playerIDs.length === 0) {
        throw new Error("no player ids!");
    }
    return Promise.all(playerIDs.map(id => {
        return request.get(`https://orirando.com/bingo/bingothon/${boardID}/player/${id.trim()}`, {json: true});
    }));
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
    /* reactivate if it's exploration again
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
    }*/
    let goalCounts = 0;
    const cells = resp[0].cards.map((card, index) => {
        const revealed = true ;//current.has(index);
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

type Ori1Meta = ExternalBingoboardMeta & {game: "ori1"};

export class Ori1ExternalBingoboard implements ExternalBingoboardManager {
    updateLoopTimer?: NodeJS.Timer;
    meta?: Ori1Meta;
    constructor(private boardRep: ReplicantServer<ExternalBingoboard>) {}
    async configure(meta: ExternalBingoboardMeta): Promise<void> {
        if (meta.game !== "ori1") {
            log.error("tried to configure ori1 bingo but game is not ori1!");
            return;
        }
        if (!meta.boardID || !meta.playerID) {
            throw new Error("invalid config!");
        }
        this.meta = meta;
        await this.oriBingoUpdate();
        if (!this.updateLoopTimer) {
            this.updateLoopTimer = setInterval(() => {
                if (this.meta) {
                    this.oriBingoUpdate().catch(e => {
                        log.error("ori1 update error:", e);
                    });
                }
            }, 3000);
        }
    }

    async oriBingoUpdate(): Promise<void> {
        if (!this.meta) return;
        try {
            // eslint-disable-next-line max-len
            // console.log('update')
            const responses = await getBoards(this.meta.boardID, this.meta.playerID);
            if (this.meta.coop) {
                const playerColor = boardMetaRep.value.playerColors[0] || 'red';
                const {cells, count} = toBingosyncBoard(responses, playerColor);
                if (this.boardRep.value) {
                    this.boardRep.value.cells = cells;
                    this.boardRep.value.colorCounts[playerColor] = count;
                } else {
                    log.error("ori1 board rep unexpectedly undefined!");
                }
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
                if (this.boardRep.value) {
                    this.boardRep.value.cells = cells;
                    this.boardRep.value.colorCounts = colorCounts;
                } else {
                    log.error("ori1 board rep unexpectedly undefined!");
                }
    
            }
        } catch (e) {
            log.error(e);
        }
    }

    deactivate(): Promise<void> {
        if (this.updateLoopTimer) {
            clearInterval(this.updateLoopTimer);
            this.updateLoopTimer = undefined;
        }
        return Promise.resolve();
    }
}
