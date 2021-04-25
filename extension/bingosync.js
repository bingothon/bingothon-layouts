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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Based on https://github.com/GamesDoneQuick/sgdq18-layouts/blob/master/src/extension/oot-bingo.ts
// Packages
const RequestPromise = __importStar(require("request-promise"));
const ws_1 = __importDefault(require("ws"));
const nodecgApiContext = __importStar(require("./util/nodecg-api-context"));
const deep_equal_1 = __importDefault(require("deep-equal"));
const clone_1 = __importDefault(require("clone"));
const invasion_1 = require("./util/invasion");
const nodecg = nodecgApiContext.get();
const log = new nodecg.Logger(`${nodecg.bundleName}:bingosync`);
const boardMetaRep = nodecg.Replicant('bingoboardMeta');
const noop = () => { }; // tslint:disable-line:no-empty
const bingosyncSocketUrl = 'wss://sockets.bingosync.com';
const bingosyncSiteUrl = 'https://bingosync.com';
// recover().catch((error) => {
//  log.error(`Failed to recover connection to room ${socketRep.value.roomCode}:`, error);
// });
class BingosyncManager {
    constructor(name, boardRep, socketRep, boardModeRep) {
        var _a;
        this.name = name;
        this.boardRep = boardRep;
        this.socketRep = socketRep;
        this.boardModeRep = boardModeRep;
        this.request = RequestPromise.defaults({ jar: true });
        this.websocket = null;
        this.invasionCtx = null;
        (_a = this.boardModeRep) === null || _a === void 0 ? void 0 : _a.on('change', (newVal, old) => {
            log.info(newVal);
            if (newVal.boardMode === 'invasion') {
                if (this.invasionCtx === null) {
                    const playerColors = boardMetaRep.value.playerColors;
                    this.invasionCtx = new invasion_1.InvasionContext(playerColors[0] || 'red', playerColors[1] || 'orange');
                    this.invasionCtx.initSides(this.boardRep.value.cells);
                }
            }
            else {
                this.invasionCtx = null;
            }
            if (this.boardRep.value.cells.length == 25) {
                this.fullUpdateMarkers();
            }
        });
        boardMetaRep.on('change', newVal => {
            if (this.invasionCtx !== null) {
                this.invasionCtx.setPlayerColor1(newVal.playerColors[0] || 'red');
                this.invasionCtx.setPlayerColor2(newVal.playerColors[1] || 'orange');
            }
        });
        // recovering past connection
        // catch startup errors when this is all empty
        if (!this.socketRep.value
            || !this.socketRep.value.roomCode
            || !this.socketRep.value.passphrase) {
            if (!this.socketRep.value) {
                this.socketRep.value = { status: 'disconnected' };
                return;
            }
            this.socketRep.value.status = 'disconnected';
        }
        // Restore previous connection on startup
        const { roomCode, passphrase } = this.socketRep.value;
        if (roomCode && passphrase) {
            log.info(`Recovering connection to room ${this.socketRep.value.roomCode}`);
            this.joinRoom(roomCode, passphrase)
                .then(() => {
                log.info(`Successfully recovered connection to room ${this.socketRep.value.roomCode}`);
            })
                .catch((e) => {
                this.socketRep.value.status = 'error';
                log.error(`Couldn't join room ${this.socketRep.value.roomCode}`, e);
            });
        }
    }
    joinRoom(roomCode, passphrase) {
        return __awaiter(this, void 0, void 0, function* () {
            this.socketRep.value.passphrase = passphrase;
            this.socketRep.value.roomCode = roomCode;
            this.socketRep.value.status = 'connecting';
            if (this.fullUpdateInterval) {
                clearInterval(this.fullUpdateInterval);
            }
            this.destroyWebsocket();
            log.info('Fetching bingosync socket key...');
            const data = yield this.request.post({
                uri: `${bingosyncSiteUrl}/api/join-room`,
                followAllRedirects: true,
                json: {
                    room: roomCode,
                    nickname: 'bingothon',
                    password: passphrase,
                },
            });
            const socketKey = data.socket_key;
            log.info('Got bingosync socket key!');
            const thisInterval = setInterval(() => {
                this.fullUpdate(roomCode).catch((error) => {
                    log.error('Failed to fullUpdate:', error);
                });
            }, 60 * 1000);
            this.fullUpdateInterval = thisInterval;
            this.tempFullUpdateInterval = thisInterval;
            yield this.fullUpdate(roomCode);
            yield this.createWebsocket(bingosyncSocketUrl, socketKey);
        });
    }
    leaveRoom() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.fullUpdateInterval) {
                clearInterval(this.fullUpdateInterval);
            }
            this.destroyWebsocket();
            this.socketRep.value.status = 'disconnected';
            this.socketRep.value.passphrase = '';
            this.socketRep.value.roomCode = '';
        });
    }
    forceRefreshInvasionCtx() {
        if (this.invasionCtx !== null) {
            this.invasionCtx.initSides(this.boardRep.value.cells);
            this.invasionCtx.setMarkers(this.boardRep.value.cells);
        }
    }
    fullUpdate(roomCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const bingosyncBoard = yield this.request.get({
                uri: `${bingosyncSiteUrl}/room/${roomCode}/board`,
                json: true,
            });
            // Bail if the room changed while this request was in-flight.
            if (this.fullUpdateInterval !== this.tempFullUpdateInterval) {
                return;
            }
            // make sure doubleclicks don't screw the number
            const goalCounts = {
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
            const newBoardState = bingosyncBoard.map((cell) => {
                // remove blank cause thats not a color
                // count all the color occurences
                let newCell = {
                    name: cell.name,
                    slot: cell.slot,
                    colors: [],
                    markers: [null, null, null, null],
                    rawColors: cell.colors,
                };
                newCell.rawColors.split(' ').forEach((color) => {
                    if (color !== 'blank') {
                        goalCounts[color] += 1;
                    }
                });
                this.processCellForMarkers(newCell);
                return newCell;
            });
            if (this.invasionCtx !== null) {
                this.invasionCtx.updateSides(newBoardState);
                this.invasionCtx.setMarkers(newBoardState);
            }
            this.boardRep.value.colorCounts = goalCounts;
            // Bail if nothing has changed.
            if (deep_equal_1.default(this.boardRep.value.cells, newBoardState)) {
                return;
            }
            this.boardRep.value.cells = newBoardState;
        });
    }
    fullUpdateMarkers() {
        const clonedCells = clone_1.default(this.boardRep.value.cells);
        clonedCells.forEach((cell) => {
            cell.markers = [null, null, null, null];
            this.processCellForMarkers(cell);
        });
        if (this.invasionCtx !== null) {
            this.invasionCtx.updateSides(clonedCells);
            this.invasionCtx.setMarkers(clonedCells);
        }
        this.boardRep.value.cells = clonedCells;
    }
    processCellForMarkers(cell) {
        if (cell.rawColors === 'blank') {
            cell.colors = [];
            return;
        }
        const newColors = [];
        const markers = [null, null, null, null];
        // each color could be overritten by a marker
        cell.rawColors.split(' ').forEach((color) => {
            var _a;
            let redirected = false;
            for (const [i, redirect] of ((_a = this.boardModeRep) === null || _a === void 0 ? void 0 : _a.value.markerRedirects.entries()) || []) {
                if (color === redirect[0]) {
                    markers[i] = redirect[1];
                    redirected = true;
                }
            }
            if (!redirected) {
                newColors.push(color);
            }
        });
        // in invasion mode, if a cell has both a marker and is filled with the same color, drop the marker
        markers.forEach((color, index) => {
            var _a;
            if (((_a = this.boardModeRep) === null || _a === void 0 ? void 0 : _a.value.boardMode) === 'invasion' && color !== null && newColors.includes(color)) {
                markers[index] = null;
            }
        });
        cell.colors = newColors;
        cell.markers = markers;
    }
    createWebsocket(socketUrl, socketKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let settled = false;
                log.info('Opening socket...');
                this.socketRep.value.status = 'connecting';
                this.websocket = new ws_1.default(`${socketUrl}/broadcast`);
                this.websocket.onopen = () => {
                    log.info('Socket opened.');
                    if (this.websocket) {
                        // eslint-disable-next-line @typescript-eslint/camelcase
                        this.websocket.send(JSON.stringify({ socket_key: socketKey }));
                    }
                };
                this.websocket.onmessage = (event) => {
                    let json;
                    try {
                        json = JSON.parse(event.data);
                    }
                    catch (error) { // tslint:disable-line:no-unused
                        log.error('Failed to parse message:', event.data);
                    }
                    if (json.type === 'error') {
                        if (this.fullUpdateInterval) {
                            clearInterval(this.fullUpdateInterval);
                        }
                        this.destroyWebsocket();
                        this.socketRep.value.status = 'error';
                        log.error('Socket protocol error:', json.error ? json.error : json);
                        if (!settled) {
                            reject(new Error(json.error ? json.error : 'unknown error'));
                            settled = true;
                        }
                        return;
                    }
                    if (!settled) {
                        resolve();
                        this.socketRep.value.status = 'connected';
                        settled = true;
                    }
                    if (json.type === 'goal') {
                        const index = parseInt(json.square.slot.slice(4), 10) - 1;
                        const cell = {
                            name: json.square.name,
                            slot: json.square.slot,
                            colors: [],
                            markers: [null, null, null, null],
                            rawColors: json.square.colors,
                        };
                        this.processCellForMarkers(cell);
                        this.boardRep.value.cells[index] = cell;
                        // update goal count
                        if (json.remove) {
                            this.boardRep.value.colorCounts[json.color] -= 1;
                        }
                        else {
                            this.boardRep.value.colorCounts[json.color] += 1;
                        }
                        if (this.invasionCtx !== null) {
                            this.invasionCtx.updateSides(this.boardRep.value.cells);
                            const clonedCells = clone_1.default(this.boardRep.value.cells);
                            this.invasionCtx.setMarkers(clonedCells);
                            this.boardRep.value.cells = clonedCells;
                        }
                    }
                };
                this.websocket.onclose = (event) => {
                    this.socketRep.value.status = 'disconnected';
                    log.info(`Socket closed (code: ${event.code}, reason: ${event.reason})`);
                    this.destroyWebsocket();
                    this.createWebsocket(socketUrl, socketKey).catch(() => {
                        // Intentionally discard errors raised here.
                        // They will have already been logged in the onmessage handler.
                    });
                };
            });
        });
    }
    destroyWebsocket() {
        if (!this.websocket) {
            return;
        }
        try {
            this.websocket.onopen = noop;
            this.websocket.onmessage = noop;
            this.websocket.onclose = noop;
            this.websocket.close();
        }
        catch (_error) { // tslint:disable-line:no-unused
            // Intentionally discard error.
        }
        this.websocket = null;
    }
}
// create different bingosync instances
const bingosyncInstances = new Map();
const mainBoardRep = nodecg.Replicant('bingoboard');
const mainSocketRep = nodecg.Replicant('bingosyncSocket');
const mainBingoboardMode = nodecg.Replicant('bingoboardMode');
const hostingBoardRep = nodecg.Replicant('hostingBingoboard');
const hostingSocketRep = nodecg.Replicant('hostingBingosocket');
bingosyncInstances.set('bingoboard', new BingosyncManager('bingoboard', mainBoardRep, mainSocketRep, mainBingoboardMode));
bingosyncInstances.set('hostingBingoboard', new BingosyncManager('hostingBingoboard', hostingBoardRep, hostingSocketRep, null)); // TODO hosting bingo bingoboard mode
// listeners for messages to interact from the dashboard
nodecg.listenFor('bingosync:joinRoom', (data, callback) => __awaiter(void 0, void 0, void 0, function* () {
    const manager = bingosyncInstances.get(data.name);
    try {
        if (!manager) {
            if (callback && !callback.handled) {
                callback(new Error(`No Bingosync Manager with name ${data.name} found`));
            }
        }
        else {
            yield manager.joinRoom(data.roomCode, data.passphrase);
            log.info(`Successfully joined room ${data.roomCode}.`);
            if (callback && !callback.handled) {
                callback(null);
            }
        }
    }
    catch (error) {
        if (manager) {
            manager.socketRep.value.status = 'error';
        }
        log.error(`Failed to join room ${data.roomCode}:`, error);
        if (callback && !callback.handled) {
            callback(error);
        }
    }
}));
nodecg.listenFor('bingosync:leaveRoom', (data, callback) => __awaiter(void 0, void 0, void 0, function* () {
    const manager = bingosyncInstances.get(data.name);
    try {
        if (!manager) {
            if (callback && !callback.handled) {
                callback(new Error(`No Bingosync Manager with name ${data.name} found`));
            }
        }
        else {
            yield manager.leaveRoom();
            log.info('Left room');
            if (callback && !callback.handled) {
                callback(null);
            }
        }
    }
    catch (error) {
        log.error('Failed to leave room:', error);
        if (callback && !callback.handled) {
            callback(error);
        }
    }
}));
nodecg.listenFor('bingosync:toggleCard', (_data, callback) => {
    try {
        boardMetaRep.value.boardHidden = !boardMetaRep.value.boardHidden;
        if (callback && !callback.handled) {
            callback(null);
        }
    }
    catch (error) {
        if (callback && !callback.handled) {
            callback(error);
        }
    }
});
nodecg.listenFor('bingosync:toggleColors', (_data, callback) => {
    try {
        boardMetaRep.value.colorShown = !boardMetaRep.value.colorShown;
        if (callback && !callback.handled) {
            callback(null);
        }
    }
    catch (error) {
        if (callback && !callback.handled) {
            callback(error);
        }
    }
});
nodecg.listenFor('bingosync:setPlayerColor', (data, callback) => {
    boardMetaRep.value.playerColors[data.idx] = data.color;
    if (callback && !callback.handled) {
        callback();
    }
});
nodecg.listenFor('bingomode:setBingoboardMode', (data, callback) => {
    if (data.boardMode === 'invasion') {
        data.markerRedirects = [];
    }
    mainBingoboardMode.value = data;
    if (callback && !callback.handled) {
        callback();
    }
});
nodecg.listenFor('bingomode:forceRefreshInvasion', (_data, callback) => {
    var _a;
    (_a = bingosyncInstances.get('bingoboard')) === null || _a === void 0 ? void 0 : _a.forceRefreshInvasionCtx();
    if (callback && !callback.handled) {
        callback();
    }
});
