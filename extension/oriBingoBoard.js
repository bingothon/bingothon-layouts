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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestPromise = __importStar(require("request-promise"));
const nodecgApiContext = __importStar(require("./util/nodecg-api-context"));
const nodecg = nodecgApiContext.get();
const log = new nodecg.Logger(`${nodecg.bundleName}:oriBingo`);
const request = RequestPromise.defaults({ jar: true });
const boardRep = nodecg.Replicant('oriBingoboard');
const boardMetaRep = nodecg.Replicant('bingoboardMeta');
// TEST: boardID: 4235, playerID:221
const oriBingoMeta = nodecg.Replicant('oriBingoMeta');
const emphasisRegex = /\*([^*]+)\*/;
let oldBoard = null;
let updateLoopTimer = null;
function processStyling(goalName) {
    while (goalName.includes('*')) {
        // eslint-disable-next-line no-param-reassign
        goalName = goalName.replace(emphasisRegex, '<span class="underline">$1</span>');
    }
    return goalName;
}
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
function getBoard(boardID, playerID) {
    return __awaiter(this, void 0, void 0, function* () {
        return request.get(`https://orirando.com/bingo/bingothon/${boardID}/player/${playerID}`, { json: true });
    });
}
function init() {
    if (boardRep.value.cells.length === 0) {
        for (let i = 0; i < 25; i += 1) {
            boardRep.value.cells.push({ name: '', hidden: true, hiddenName: '', colors: 'blank', slot: `slot${i}` });
        }
    }
}
function oriBingoUpdate() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // eslint-disable-next-line max-len
            const oriResp = yield getBoard(oriBingoMeta.value.boardID, oriBingoMeta.value.playerID);
            const oriResp2 = yield getBoard(oriBingoMeta.value.boardID, 1);
            const oriBoard = oriResp.cards;
            const oriBoardRevealed = [];
            const playerColor = boardMetaRep.value.playerColors[0] || 'red';
            let goalCount = 0;
            oriBoard.forEach((field, idx) => {
                const shouldBeRevealed = squareShouldBeRevealed(oriResp, idx);
                if (!oldBoard || oldBoard[idx].name !== field.name || oldBoard[idx].revealed !== shouldBeRevealed) {
                    if (shouldBeRevealed) {
                        boardRep.value.cells[idx].name = processStyling(field.name);
                    }
                    else {
                        boardRep.value.cells[idx].name = '';
                    }
                }
                if (field.completed || oriResp2.cards[idx].completed) {
                    boardRep.value.cells[idx].colors = playerColor;
                    goalCount++;
                }
                else {
                    boardRep.value.cells[idx].colors = 'blank';
                }
                oriBoardRevealed.push({ name: field.name, completed: field.completed, revealed: shouldBeRevealed });
            });
            boardRep.value.colorCounts[playerColor] = goalCount;
            oldBoard = oriBoardRevealed;
        }
        catch (e) {
            log.error(e);
        }
    });
}
// recover the room at server restart
function recover() {
    oriBingoMeta.once('change', (newVal) => __awaiter(this, void 0, void 0, function* () {
        if (!newVal.active)
            return;
        const { boardID } = newVal;
        const { playerID } = newVal;
        try {
            yield getBoard(boardID, playerID);
            updateLoopTimer = setInterval(oriBingoUpdate, 3000);
            log.info('Successfully recovered connection to Ori Board');
        }
        catch (e) {
            log.error('Can\'t recover connection to Ori Board!', e);
        }
    }));
}
function squareShouldBeRevealed(apiResp, idx) {
    if (apiResp.disc_squares.includes(idx) || apiResp.cards[idx].completed) {
        return true;
    }
    if (idx - 5 >= 0) {
        const other = idx - 5;
        if (apiResp.disc_squares.includes(other) || apiResp.cards[other].completed) {
            return true;
        }
    }
    if (idx % 5 !== 0 && idx - 1 >= 0) {
        const other = idx - 1;
        if (apiResp.disc_squares.includes(other) || apiResp.cards[other].completed) {
            return true;
        }
    }
    if (idx + 5 < 25) {
        const other = idx + 5;
        if (apiResp.disc_squares.includes(other) || apiResp.cards[other].completed) {
            return true;
        }
    }
    if (idx % 5 !== 4 && idx + 1 < 25) {
        const other = idx + 1;
        if (apiResp.disc_squares.includes(other) || apiResp.cards[other].completed) {
            return true;
        }
    }
    return false;
}
nodecg.listenFor('oriBingo:activate', (data, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (updateLoopTimer) {
            clearTimeout(updateLoopTimer);
        }
        // see if the board/player actually exists
        const boardID = parseInt(data.boardID, 10);
        const playerID = parseInt(data.playerID, 10);
        yield getBoard(boardID, playerID);
        oriBingoMeta.value = { active: true, boardID, playerID };
        updateLoopTimer = setInterval(oriBingoUpdate, 3000);
        if (callback && !callback.handled) {
            callback();
        }
    }
    catch (error) {
        log.error(error);
        if (callback && !callback.handled) {
            callback(error);
        }
    }
}));
nodecg.listenFor('oriBingo:deactivate', (_data, callback) => __awaiter(void 0, void 0, void 0, function* () {
    oriBingoMeta.value.active = false;
    if (updateLoopTimer) {
        clearInterval(updateLoopTimer);
    }
    if (callback && !callback.handled) {
        callback();
    }
}));
init();
recover();
