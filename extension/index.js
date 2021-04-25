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
const nodecgApiContext = __importStar(require("./util/nodecg-api-context"));
module.exports = (nodecg) => {
    nodecgApiContext.set(nodecg);
    nodecg.log.info('Extension code working!');
    const { bundleConfig } = nodecg;
    require('./bingosync');
    require('./bingoColors');
    require('./oriBingoBoard');
    require('./explorationBingo');
    if (nodecg.bundleConfig.discord) {
        if (!nodecg.bundleConfig.discord.test) {
            require('./discord');
        }
        else {
            const voiceActivity = nodecg.Replicant('voiceActivity', {
                defaultValue: {
                    members: [],
                },
                persistent: true,
            });
            const defaultAvatar = 'https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png';
            voiceActivity.value = {
                members: [
                    {
                        id: '0', name: 'abc', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '1', name: 'testlongname', avatar: defaultAvatar, isSpeaking: true,
                    },
                    {
                        id: '2', name: 'anotherone', avatar: defaultAvatar, isSpeaking: true,
                    },
                    {
                        id: '3', name: 'POGGERS', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '4', name: 'asdfasdf', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '5', name: 'someone', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '6', name: 'idk this is a lot', avatar: defaultAvatar, isSpeaking: true,
                    },
                    {
                        id: '7', name: 'not creative', avatar: defaultAvatar, isSpeaking: true,
                    },
                    {
                        id: '8', name: 'nr8', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '9', name: 'nr8', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '10', name: 'nr8', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '11', name: 'nr8', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '12', name: 'nr8', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '13', name: 'nr8', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '14', name: 'nr8', avatar: defaultAvatar, isSpeaking: false,
                    },
                ],
            };
        }
    }
    require('./twitch-chat-bot');
    require('./gdq-donationtracker');
    require('./streams');
    require('./util/obs');
    require('./obsremotecontrol');
    if (bundleConfig.mpd && bundleConfig.mpd.enable) {
        require('./music');
    }
    else {
        nodecg.log.warn('MPD integration is disabled, no music!');
        nodecg.Replicant('songData', { persistent: false, defaultValue: { playing: false, title: 'No Track Playing' } });
    }
    // this doesn't really belong anywhere
    // just make sure to declare
    nodecg.Replicant('showPictureDuringIntermission');
    //const text = fs.readFileSync('src/graphics/host-dashboard/fhfacts.txt', 'utf-8');
};
