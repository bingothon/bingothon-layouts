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

function getNeighbors(row: number, column: number, rowCount: number, columnCount: number): [number, number][] {
    const result: [number, number][] = [];
    if (row > 0) {
        result.push([row - 1, column]);
    }
    if (column > 0) {
        result.push([row, column - 1]);
    }
    if (row < (rowCount - 1)) {
        result.push([row + 1, column]);
    }
    if (column < (columnCount - 1)) {
        result.push([row, column + 1]);
    }
    return result;
}

function updateVisibilities(): void {
    const rowCount = explorationBoardRep.value.cells.length;
    const columnCount = explorationBoardRep.value.cells.at(0)?.length ?? 5;
    const revealed = explorationBoardRep.value.revealed ?? [];
    explorationBoardRep.value.cells.forEach((row, rowIndex, allCells): void => {
        row.forEach((cell, columnIndex) => {
            /* eslint-disable no-param-reassign */
            if (revealed.some(r => (r.column === columnIndex && r.row === rowIndex))
                || getNeighbors(rowIndex, columnIndex, rowCount, columnCount).some(([r, c]): boolean => !!allCells[r][c].colors.length)) {
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

nodecg.listenFor('exploration:newGoals', ({rows, columns, goals, revealed}: {rows: number, columns: number, goals: string[], revealed: {row: number, column: number}[]}, callback): void => {
    if (goals.length !== rows * columns) {
        if (callback && !callback.handled) {
            callback(new Error("Length doesn't match dimensions!"));
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
        explorationBoardRep.value = { colorCounts: defaultEmptyColorCounts, cells: toNxMArray(cells, columns, rows), revealed };
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
            cell.name = '';
            cell.hidden = true;
            cell.colors = [];
            /* eslint-enable no-param-reassign */
        })
    });
    updateVisibilities();
    if (callback && !callback.handled) {
        callback(null);
    }
});

nodecg.listenFor('exploration:goalClicked', ({row, column}: {row: number, column: number}, callback): void => {
    if (typeof row !== 'number' || typeof column !== 'number') {
        if (callback && !callback.handled) {
            callback(new Error('row and column of the goal has to be a number!'));
            return;
        }
    }
    // only allow one color
    const playerColor = boardMetaRep.value.playerColors[0];
    if (explorationBoardRep.value.cells[row][column].colors.length) {
        explorationBoardRep.value.cells[row][column].colors = [];
    } else {
        explorationBoardRep.value.cells[row][column].colors = [playerColor || 'red'];
    }
    updateVisibilities();
    if (callback && !callback.handled) {
        callback(null);
    }
});
