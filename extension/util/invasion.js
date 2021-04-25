"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvasionContext = exports.InvasionStart = void 0;
var InvasionStart;
(function (InvasionStart) {
    InvasionStart[InvasionStart["LEFT"] = 0] = "LEFT";
    InvasionStart[InvasionStart["TOP_LEFT"] = 1] = "TOP_LEFT";
    InvasionStart[InvasionStart["TOP"] = 2] = "TOP";
    InvasionStart[InvasionStart["TOP_RIGHT"] = 3] = "TOP_RIGHT";
    InvasionStart[InvasionStart["RIGHT"] = 4] = "RIGHT";
    InvasionStart[InvasionStart["BOTTOM_RIGHT"] = 5] = "BOTTOM_RIGHT";
    InvasionStart[InvasionStart["BOTTOM"] = 6] = "BOTTOM";
    InvasionStart[InvasionStart["BOTTOM_LEFT"] = 7] = "BOTTOM_LEFT";
})(InvasionStart = exports.InvasionStart || (exports.InvasionStart = {}));
const CORNER_STARTS = Object.freeze([InvasionStart.TOP_LEFT, InvasionStart.TOP_RIGHT, InvasionStart.BOTTOM_RIGHT, InvasionStart.BOTTOM_LEFT]);
const SIDE_STARTS = Object.freeze([InvasionStart.LEFT, InvasionStart.TOP, InvasionStart.RIGHT, InvasionStart.BOTTOM]);
class InvasionContext {
    constructor(playerColor1, playerColor2) {
        this.playerColor1 = playerColor1;
        this.playerColor2 = playerColor2;
        this.player1start = null;
    }
    setPlayerColor1(color) {
        this.playerColor1 = color;
    }
    setPlayerColor2(color) {
        this.playerColor2 = color;
    }
    initSides(cells) {
        if (isEmpty(cells))
            return;
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
    updateSides(cells) {
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
    setMarkers(cells) {
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
        }
        else {
            if ((this.player1start % 2) === 1) {
                // corner start, set markers for both sides
                this.setMarkersI(cells, 0, this.playerColor1, this.player1start - 1);
                this.setMarkersI(cells, 0, this.playerColor1, (this.player1start + 1) % 8);
                const player2start = getInverse(this.player1start);
                this.setMarkersI(cells, 1, this.playerColor2, player2start - 1);
                this.setMarkersI(cells, 1, this.playerColor2, (player2start + 1) % 8);
            }
            else {
                // locked to a single side
                this.setMarkersI(cells, 0, this.playerColor1, this.player1start);
                const player2start = getInverse(this.player1start);
                this.setMarkersI(cells, 1, this.playerColor2, player2start);
            }
        }
    }
    setMarkersI(cells, playerIdx, playerColor, side) {
        let maxGoalCount = 5;
        // similar to isValid, check if at least one goal can still be clicked on this line
        for (let i = 0; i < 5; i++) {
            let lineGoalCount = 0;
            for (let j = 0; j < 5; j++) {
                if (getColor(cells, side, i, j) === playerColor) {
                    lineGoalCount++;
                }
            }
            // strictly lower, so another goal can be clicked here
            if (lineGoalCount < maxGoalCount) {
                for (let j = 0; j < 5; j++) {
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
exports.InvasionContext = InvasionContext;
function isEmpty(cells) {
    return cells.every(cell => cell.rawColors === 'blank');
}
function sideValid(cells, side, color) {
    // TOP_LEFT etc. need both TOP and LEFT
    if ((side % 2) === 1) {
        return sideValid(cells, side - 1, color) && sideValid(cells, (side + 1) % 8, color);
    }
    else {
        let maxGoalCount = 5;
        for (let i = 0; i < 5; i++) {
            let lineGoalCount = 0;
            for (let j = 0; j < 5; j++) {
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
function getColor(cells, side, x, y) {
    return cells[getRotatedIndex(side, x, y)].rawColors;
}
function getRotatedIndex(side, x, y) {
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
function getInverse(start) {
    return (start + 4) % 8;
}
