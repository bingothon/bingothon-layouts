import * as nodecgApiContext from './util/nodecg-api-context';
import { boardMetaRep, explorationBoardRep } from './util/replicants';
import { ExplorationBingoboardCell } from '../../types';
import { toNxMArray } from './util/bingo';

const nodecg = nodecgApiContext.get();

const defaultEmptyColorCounts = {
    pink: 0,
    red: 0,
    orange: 0,
    brown: 0,
    yellow: 0,
    green: 0,
    teal: 0,
    blue: 0,
    navy: 0,
    purple: 0
};

function getNeighbors(row: number, column: number): [number, number][] {
    const result: [number, number][] = [];
    if (row > 0) {
        result.push([row - 1, column]);
    }
    if (column > 0) {
        result.push([row, column - 1]);
    }
    if (row < 4) {
        result.push([row + 1, column]);
    }
    if (column < 4) {
        result.push([row, column + 1]);
    }
    return result;
}

function updateVisibilities(): void {
    explorationBoardRep.value.cells.forEach((row, rowIndex, allCells): void => {
        row.forEach((cell, columnIndex) => {
            /* eslint-disable no-param-reassign */
            if ((rowIndex === 1 && columnIndex === 1)
                || (rowIndex === 3 && columnIndex === 3)
                || getNeighbors(rowIndex, columnIndex).some(([r, c]): boolean => !!allCells[r][c].colors.length)) {
                cell.name = cell.hiddenName;
                cell.hidden = false;
            } else {
                cell.name = '';
                cell.hidden = true;
            }
            /* eslint-enable no-param-reassign */
        })
    });
}

nodecg.listenFor('exploration:newGoals', (goals: string[], callback): void => {
    if (goals.length !== 25) {
        if (callback && !callback.handled) {
            callback(new Error('There have to be exactly 25 goals!'));
        }
    } else {
        // reset counts and colors
        const cells = goals.map(
            (g, idx): ExplorationBingoboardCell => ({
                name: '',
                hiddenName: g,
                hidden: true,
                slot: `slot${idx}`,
                colors: []
            })
        );
        explorationBoardRep.value = { colorCounts: defaultEmptyColorCounts, cells: toNxMArray(cells, 5, 5) };
        updateVisibilities();
        if (callback && !callback.handled) {
            callback(null);
        }
    }
});

nodecg.listenFor('exploration:resetBoard', (_data, callback): void => {
    explorationBoardRep.value.colorCounts = defaultEmptyColorCounts;
    explorationBoardRep.value.cells.forEach((row, rowIndex): void => {
        row.forEach((cell, columnIndex) => {
            /* eslint-disable no-param-reassign */
            if ((rowIndex === 1 && columnIndex === 1)
                || (rowIndex === 3 && columnIndex === 3)) {
                cell.name = cell.hiddenName;
                cell.hidden = false;
            } else {
                cell.name = '';
                cell.hidden = true;
            }
            cell.colors = [];
            /* eslint-enable no-param-reassign */
        })
    });
    if (callback && !callback.handled) {
        callback(null);
    }
});

nodecg.listenFor('exploration:goalClicked', (goal, callback): void => {
    if (!goal || typeof goal.index !== 'number') {
        if (callback && !callback.handled) {
            callback(new Error('index of the goal has to be a number!'));
            return;
        }
    }
    // only allow one color
    const playerColor = boardMetaRep.value.playerColors[0];
    const { index } = goal;
    if (index < 0 || index >= 25) {
        if (callback && !callback.handled) {
            callback(new Error('index has to be between 0 (inclusive) and 25 (exclusive)'));
            return;
        }
    }
    const rowIdx = Math.floor(index / 5);
    const colIdx = index % 5;
    if (explorationBoardRep.value.cells[rowIdx][colIdx].colors.length) {
        explorationBoardRep.value.cells[rowIdx][colIdx].colors = [];
    } else {
        explorationBoardRep.value.cells[rowIdx][colIdx].colors = [playerColor || 'red'];
    }
    updateVisibilities();
    if (callback && !callback.handled) {
        callback(null);
    }
});
