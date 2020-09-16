import { BingoboardMeta, Bingoboard, BingosyncSocket, BingoboardMode } from '../../../schemas';

import { BingoboardCell } from "../../../types";

export enum InvasionStart {
    LEFT = 0,
    TOP_LEFT,
    TOP,
    TOP_RIGHT,
    RIGHT,
    BOTTOM_RIGHT,
    BOTTOM,
    BOTTOM_LEFT,
}

const CORNER_STARTS = Object.freeze([InvasionStart.TOP_LEFT, InvasionStart.TOP_RIGHT, InvasionStart.BOTTOM_RIGHT, InvasionStart.BOTTOM_LEFT]);

const SIDE_STARTS = Object.freeze([InvasionStart.LEFT, InvasionStart.TOP, InvasionStart.RIGHT, InvasionStart.BOTTOM]);

export class InvasionContext {
    player1start: InvasionStart | null = null;

    constructor(private playerColor1: string, private playerColor2: string) {}

    public setPlayerColor1(color: string) {
        this.playerColor1 = color;
    }

    public setPlayerColor2(color: string) {
        this.playerColor2 = color;
    }

    public initSides(cells: BingoboardCell[]) {
        if (isEmpty(cells)) return;
        // check for corner starts
        for (let side of CORNER_STARTS) {
            if (sideValid(cells, side, this.playerColor1) && sideValid(cells, getInverse(side), this.playerColor2)) {
                this.player1start = side;
                return;
            }
        }
        // check for side starts
        for (let side of SIDE_STARTS) {
            if (sideValid(cells, side, this.playerColor1) && sideValid(cells, getInverse(side), this.playerColor2)) {
                this.player1start = side;
                return;
            }
        }
    }

    public updateSides(cells: BingoboardCell[]) {
        if (isEmpty(cells)) {
            this.player1start = null;
            return;
        }
        // if players are already locked into a side, it will stay that way
        if (this.player1start === null || CORNER_STARTS.includes(this.player1start)) {
            this.initSides(cells);
            return;
        }
    }

    public setMarkers(cells: BingoboardCell[]) {
        // clear all markers
        // TODO: reduce replicant updates
        for (const cell of cells) {
            cell.markers[0] = null;
            cell.markers[1] = null;
        }
        if (this.player1start === null) {
            // if no goal has been clicked, all goals on edges should be marked
            for (let side of SIDE_STARTS) {
                this.setMarkersI(cells, 0, this.playerColor1, side);
                this.setMarkersI(cells, 1, this.playerColor2, side);
            }
        } else {
            if ((this.player1start % 2) === 1) {
                // corner start, set markers for both sides
                this.setMarkersI(cells, 0, this.playerColor1, this.player1start-1);
                this.setMarkersI(cells, 0, this.playerColor1, (this.player1start+1)%8);

                const player2start = getInverse(this.player1start);
                this.setMarkersI(cells, 1, this.playerColor2, player2start-1);
                this.setMarkersI(cells, 1, this.playerColor2, (player2start+1)%8);
            } else {
                // locked to a single side
                this.setMarkersI(cells, 0, this.playerColor1, this.player1start);

                const player2start = getInverse(this.player1start);
                this.setMarkersI(cells, 1, this.playerColor2, player2start);
            }
        }
    }

    private setMarkersI(cells: BingoboardCell[], playerIdx: number, playerColor: string, side: InvasionStart): void {
        let maxGoalCount = 5;
        // similar to isValid, check if at least one goal can still be clicked on this line
        for (let i = 0;i<5;i++) {
            let lineGoalCount = 0;
            for (let j = 0;j<5;j++) {
                if (getColor(cells, side, i, j) === playerColor) {
                    lineGoalCount++;
                }
            }
            // strictly lower, so another goal can be clicked here
            if (lineGoalCount < maxGoalCount) {
                for (let j = 0;j<5;j++) {
                    const cell = cells[getRotatedIndex(side, i, j)];
                    if (cell.rawColors === 'blank') {
                        // set markers only if cell is empty
                        cell.markers[playerIdx] = playerColor;
                    }
                }
            }
            maxGoalCount = Math.min(lineGoalCount, maxGoalCount);
        }
    }
}

function isEmpty(cells: BingoboardCell[]): boolean {
    return cells.every(cell => cell.rawColors === 'blank');
}

function sideValid(cells: BingoboardCell[], side: InvasionStart, color: string): boolean {
    // TOP_LEFT etc. need both TOP and LEFT
    if ((side % 2) === 1) {
        return sideValid(cells, side-1, color) && sideValid(cells, (side+1)%8, color);
    } else {
        let maxGoalCount = 5;
        for (let i = 0;i<5;i++) {
            let lineGoalCount = 0;
            for (let j = 0;j<5;j++) {
                if (getColor(cells, side, i, j) === color) {
                    lineGoalCount++;
                }
            }
            if (lineGoalCount > maxGoalCount) {
                return false;
            }
            maxGoalCount = lineGoalCount;
        }
        return true;
    }
}

/**
 * Get the color of the board, looking from a side
 * @param board bingoboard
 * @param side the starting side, can't be a corner
 * @param x lines away from the starting side (0 indexed)
 * @param y 0 to 5 (exclusive) to get all squares in that line, makes no guarantees otherwise
 */
function getColor(cells: BingoboardCell[], side: InvasionStart, x: number, y: number): string {
    return cells[getRotatedIndex(side, x, y)].rawColors;
}

function getRotatedIndex(side: InvasionStart, x: number, y: number): number {
    switch (side) {
        case InvasionStart.LEFT:
            return x + 5 * y;
        case InvasionStart.TOP:
            return 5 * x + y;
        case InvasionStart.RIGHT:
            return (4 - x) + 5 * y;
        case InvasionStart.BOTTOM:
            return 5 * (4 - x) + y;
        default:
            // all other sides are invalid here
            throw new Error("Invalid side for getRotatedIndex");
    }
}

function getInverse(start: InvasionStart): InvasionStart {
    return (start + 4) % 8;
}