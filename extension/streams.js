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
// Twitch aspect ratio 1024x576
const runDataActiveRunReplicant = nodecg.Replicant('runDataActiveRun', 'nodecg-speedcontrol');
const streamsReplicant = nodecg.Replicant('twitchStreams', { defaultValue: [] });
const soundOnTwitchStream = nodecg.Replicant('soundOnTwitchStream', { defaultValue: -1 });
const aspectRatioToCropping = {
    '16:9': {
        widthPercent: 100, heightPercent: 100, topPercent: 0, leftPercent: 0,
    },
    '16:9 co-op': {
        widthPercent: 100, heightPercent: 100, topPercent: 0, leftPercent: 0,
    },
    '15:9': {
        widthPercent: 106.667, heightPercent: 100, topPercent: 0, leftPercent: 0,
    },
    '4:3': {
        widthPercent: 133.333, heightPercent: 100, topPercent: 0, leftPercent: 0,
    },
    '4:3 co-op': {
        widthPercent: 133.333, heightPercent: 100, topPercent: 0, leftPercent: 0,
    },
    '3:2': {
        widthPercent: 118.5255, heightPercent: 100, topPercent: 0, leftPercent: 0,
    },
    '10:9': {
        widthPercent: 160, heightPercent: 100, topPercent: 0, leftPercent: 0,
    },
    '10:9 co-op': {
        widthPercent: 160, heightPercent: 100, topPercent: 0, leftPercent: 0,
    },
    'DS': {
        widthPercent: 240, heightPercent: 100, topPercent: 0, leftPercent: 0,
    },
    '16:10': {
        widthPercent: 111.111, heightPercent: 100, topPercent: 0, leftPercent: 0,
    },
};
streamsReplicant.once('change', () => {
    runDataActiveRunReplicant.on('change', (newVal, old) => {
        // don't reset on server restart
        if (!newVal || !old)
            return;
        // set the initial cropping based on the aspect ratio marked in the schedule
        let cropping = {
            widthPercent: 100, heightPercent: 100, topPercent: 0, leftPercent: 0,
        };
        if (newVal.customData && newVal.customData.Layout) {
            cropping = aspectRatioToCropping[newVal.customData.Layout] || cropping;
        }
        // grab all runners
        const newStreams = [];
        let idx = 0;
        newVal.teams.forEach((team, teamIndex) => {
            team.players.forEach((player, playerIndex) => {
                var _a, _b;
                // nodecg.log.info(`${player.social.twitch} to ${old.teams[teamIndex]?.players[playerIndex]?.social.twitch}`)
                // in case the replicant changed, but this stream wasn't affected, don't reset cropping
                // fill everything with defaults
                let current = {
                    channel: 'esamarathon',
                    quality: 'chunked',
                    widthPercent: 100,
                    heightPercent: 100,
                    topPercent: 0,
                    leftPercent: 0,
                    volume: 1,
                    paused: false,
                    delay: -1,
                    availableQualities: [],
                };
                current.widthPercent = cropping.widthPercent;
                current.heightPercent = cropping.heightPercent;
                current.topPercent = cropping.topPercent;
                current.leftPercent = cropping.leftPercent;
                if (!player.social || !player.social.twitch) {
                    nodecg.log.error(`Twitch name for player ${player.name} missing!`);
                    current.paused = true;
                }
                else {
                    const oldStream = streamsReplicant.value[idx];
                    // check against old replicant, in case of a stream override
                    if (!oldStream || player.social.twitch !== ((_b = (_a = old.teams[teamIndex]) === null || _a === void 0 ? void 0 : _a.players[playerIndex]) === null || _b === void 0 ? void 0 : _b.social.twitch)) {
                        current.channel = player.social.twitch;
                    }
                    else {
                        current = oldStream;
                    }
                }
                newStreams.push(current);
                idx += 1;
            });
        });
        // make sure soundOnTwitchStream isn't OoB in streamsReplicant
        if (soundOnTwitchStream.value >= newStreams.length) {
            soundOnTwitchStream.value = -1; // mute all
        }
        streamsReplicant.value = newStreams;
    });
});
nodecg.listenFor('streams:setSoundOnTwitchStream', (streamNr, callback) => {
    soundOnTwitchStream.value = streamNr;
    if (callback && !callback.handled) {
        callback();
    }
});
nodecg.listenFor('streams:toggleStreamPlayPause', (streamNr, callback) => {
    if (streamNr >= 0 && streamNr < streamsReplicant.value.length) {
        streamsReplicant.value[streamNr].paused = !streamsReplicant.value[streamNr].paused;
    }
    if (callback && !callback.handled) {
        callback();
    }
});
nodecg.listenFor('streams:setStreamVolume', (data, callback) => {
    if (data.volume > 1 || data.volume < 0) {
        if (callback && !callback.handled) {
            callback('volume has to be between 0 and 1!');
        }
        return;
    }
    if (data.id >= 0 && data.id < streamsReplicant.value.length) {
        streamsReplicant.value[data.id].volume = data.volume;
    }
    if (callback && !callback.handled) {
        callback();
    }
});
nodecg.listenFor('streams:setStreamQuality', (data, callback) => {
    if (data.id >= 0 && data.id < streamsReplicant.value.length) {
        streamsReplicant.value[data.id].quality = data.quality;
    }
    if (callback && !callback.handled) {
        callback();
    }
});
