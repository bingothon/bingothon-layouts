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
// not sure if a seperate file for this is needed, maybe refactor
const nodecgApiContext = __importStar(require("./util/nodecg-api-context"));
const nodecg = nodecgApiContext.get();
const boardMetaRep = nodecg.Replicant('bingoboardMeta');
const bingoboardMode = nodecg.Replicant('bingoboardMode');
const runDataActiveRunRep = nodecg.Replicant('runDataActiveRun', 'nodecg-speedcontrol');
// const log = new nodecg.Logger(`${nodecg.bundleName}:bingoColors`);
const ALL_COLORS = ['pink', 'red', 'orange', 'brown', 'yellow', 'green', 'teal', 'blue', 'navy', 'purple'];
nodecg.listenFor('timerStart', 'nodecg-speedcontrol', () => {
    boardMetaRep.value.boardHidden = false;
});
boardMetaRep.once('change', () => {
    runDataActiveRunRep.on('change', (newValue, old) => {
        // bail on server restart
        if (!newValue || !old)
            return;
        // bail if this is still the old run and the player's haven't changed (still rerun this is the player count changes)'
        if (newValue.id === old.id && newValue.teams.length === old.teams.length)
            return;
        // Hide board when new run starts
        boardMetaRep.value.boardHidden = true;
        // default colors for players
        const newBingoColors = [];
        if (newValue.teams) {
            newValue.teams.forEach((team, i) => {
                team.players.forEach(() => {
                    newBingoColors.push(ALL_COLORS[i]);
                });
            });
        }
        boardMetaRep.value.playerColors = newBingoColors;
        // set other useful defaults
        if (newValue.customData && newValue.customData.Bingotype) {
            const bingotype = newValue.customData.Bingotype;
            if (bingotype.startsWith('single')) {
                boardMetaRep.value.countShown = false;
            }
            else if (bingotype.startsWith('blackout')) {
                boardMetaRep.value.countShown = true;
            }
        }
        // reset bingoboard mode
        bingoboardMode.value.boardMode = "normal";
        bingoboardMode.value.markerRedirects = [];
    });
});
