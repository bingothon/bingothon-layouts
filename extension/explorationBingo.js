"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodecgApiContext = __importStar(require("./util/nodecg-api-context"));
const nodecg = nodecgApiContext.get();
// const log = new nodecg.Logger(`${nodecg.bundleName}:explorationBingo`);
const explorationBoardRep = nodecg.Replicant('explorationBingoboard');
const bingoMetaRep = nodecg.Replicant('bingoboardMeta');
const defaultEmptyColorCounts = {
    pink: 0, red: 0, orange: 0, brown: 0, yellow: 0, green: 0, teal: 0, blue: 0, navy: 0, purple: 0,
};
function getNeighbors(idx) {
    const result = [];
    if (idx - 5 >= 0) {
        result.push(idx - 5);
    }
    if (idx % 5 !== 0 && idx - 1 >= 0) {
        result.push(idx - 1);
    }
    if (idx + 5 < 25) {
        result.push(idx + 5);
    }
    if (idx % 5 !== 4 && idx + 1 < 25) {
        result.push(idx + 1);
    }
    return result;
}
function updateVisibilities() {
    explorationBoardRep.value.cells.forEach((cell, idx, allCells) => {
        /* eslint-disable no-param-reassign */
        if (idx === 6
            || idx === 18
            || getNeighbors(idx).some((i) => allCells[i].colors !== 'blank')) {
            cell.name = cell.hiddenName;
            cell.hidden = false;
        }
        else {
            cell.name = '';
            cell.hidden = true;
        }
        /* eslint-enable no-param-reassign */
    });
}
nodecg.listenFor('exploration:newGoals', (goals, callback) => {
    if (goals.length !== 25) {
        if (callback && !callback.handled) {
            callback(new Error('There have to be exactly 25 goals!'));
        }
    }
    else {
        // reset counts and colors
        const cells = goals.map((g, idx) => ({
            name: '',
            hiddenName: g,
            hidden: true,
            slot: `slot${idx}`,
            colors: 'blank',
        }));
        explorationBoardRep.value = { colorCounts: defaultEmptyColorCounts, cells };
        updateVisibilities();
        if (callback && !callback.handled) {
            callback(null);
        }
    }
});
nodecg.listenFor('exploration:resetBoard', (_data, callback) => {
    explorationBoardRep.value.colorCounts = defaultEmptyColorCounts;
    explorationBoardRep.value.cells.forEach((cell, idx) => {
        /* eslint-disable no-param-reassign */
        if (idx === 6 || idx === 18) {
            cell.name = cell.hiddenName;
            cell.hidden = false;
        }
        else {
            cell.name = '';
            cell.hidden = true;
        }
        cell.colors = 'blank';
        /* eslint-enable no-param-reassign */
    });
    if (callback && !callback.handled) {
        callback(null);
    }
});
nodecg.listenFor('exploration:goalClicked', (goal, callback) => {
    if (!goal || typeof goal.index !== 'number') {
        if (callback && !callback.handled) {
            callback(new Error('index of the goal has to be a number!'));
            return;
        }
    }
    // only allow one color
    const playerColor = bingoMetaRep.value.playerColors[0];
    const { index } = goal;
    if (index < 0 || index >= 25) {
        if (callback && !callback.handled) {
            callback(new Error('index has to be between 0 (inclusive) and 25 (exclusive)'));
            return;
        }
    }
    if (explorationBoardRep.value.cells[index].colors === 'blank') {
        explorationBoardRep.value.cells[index].colors = playerColor || 'red';
    }
    else {
        explorationBoardRep.value.cells[index].colors = 'blank';
    }
    updateVisibilities();
    if (callback && !callback.handled) {
        callback(null);
    }
});
