"use strict";
'use-strict';
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tmi = __importStar(require("tmi.js"));
// eslint-disable-next-line import/no-extraneous-dependencies
const bingodefinitions_1 = __importDefault(require("./bingodefinitions"));
const nodecgApiContext = __importStar(require("./util/nodecg-api-context"));
const waitForReplicants_1 = require("./util/waitForReplicants");
const nodecg = nodecgApiContext.get();
const log = new nodecg.Logger(`${nodecg.bundleName}:twitch-chat-bot`);
// Map<str, {response:bla, enabled:true, cooldown:0, lastUsed:123456}>
// var chatCommandsRep = nodecg.Replicant('chatCommands', {defaultValue: {}});
// keep track of cooldowns
const cooldowns = { runner: { lastUsed: 0, cooldown: 15 }, bingo: { lastUsed: 0, cooldown: 15 } };
// in case the cooldowns need to be adjusted
/* nodecg.listenFor('setCommandCooldown',data=>{
    if (!data || !data.command || !data.cooldown) {
        log.error("can't set cooldown if command and/or cooldown are missing, got:",data);
    } else {
        var com = cooldowns[data.command];
        if (com) {
            com.cooldown = data.cooldown;
        }
    }
}) */
// Setting up replicants.
const twichAPIDataRep = nodecg.Replicant('twitchAPIData', 'nodecg-speedcontrol');
const runDataActiveRunRep = nodecg.Replicant('runDataActiveRun', 'nodecg-speedcontrol');
const bundleConfig = nodecg.bundleConfig;
function getTwitchAccessToken() {
    return twichAPIDataRep.value.accessToken || '';
}
function waitForEverythingReady() {
    return new Promise((resolve, _) => {
        waitForReplicants_1.waitForReplicants([twichAPIDataRep, runDataActiveRunRep], () => {
            twichAPIDataRep.on('change', val => {
                if (val.state == 'on') {
                    resolve();
                }
            });
        });
    });
}
if (bundleConfig.twitch && bundleConfig.twitch.enable && bundleConfig.twitch.chatBot) {
    waitForEverythingReady().then(() => {
        log.info('Twitch chat bot is enabled.');
        nodecg.listenFor("repeaterFeaturedChannels", "nodecg-speedcontrol", (channels) => {
            if (twichAPIDataRep.value.channelName) {
                client.say(twichAPIDataRep.value.channelName, `!ffzfollow ${channels.join(', ')}`);
            }
        });
        const options = {
            options: {
            // debug: true,  // might want to turn off when in production
            },
            connection: {
                secure: true,
                reconnect: true,
            },
            identity: {
                username: twichAPIDataRep.value.channelName || '',
                password: getTwitchAccessToken,
            },
        };
        const client = tmi.Client(options);
        // message handler function
        function messageHandler(channel, user, message, self) {
            // only listen to commands in chat
            if (self)
                return;
            if (user['message-type'] !== 'chat')
                return;
            if (!message.startsWith('!'))
                return;
            const parts = message.split(' ', 3);
            const userCommandName = parts[0].slice(1);
            const now = new Date().getTime();
            if (userCommandName === 'runner' || userCommandName === 'runners' || userCommandName === 'r') {
                // check cooldown to not spam chat
                if (now - cooldowns.runner.lastUsed < cooldowns.runner.cooldown) {
                    return;
                }
                cooldowns.runner.lastUsed = now;
                // Grab current runners and format them & their twitch
                // should never happen
                if (!runDataActiveRunRep.value) {
                    return;
                }
                // rip flatMap
                let players = [];
                // eslint-disable-next-line
                runDataActiveRunRep.value.teams.forEach(t => players = players.concat(t.players));
                const runersStr = players.map((p, idx) => `Player ${idx + 1}: ${p.name} ( twitch.tv/${p.social.twitch} )`).join('. ');
                if (runersStr) {
                    client.say(channel, `Follow the runners! ${runersStr}`)
                        .catch((e) => log.error('', e));
                }
                return;
            }
            if (userCommandName === 'bingo') {
                // check cooldown to not spam chat
                if (now - cooldowns.bingo.lastUsed < cooldowns.bingo.cooldown) {
                    return;
                }
                cooldowns.bingo.lastUsed = now;
                if (runDataActiveRunRep.value && runDataActiveRunRep.value.customData) {
                    const bingotype = runDataActiveRunRep.value.customData.Bingotype;
                    if (bingotype) {
                        const isCoop = runDataActiveRunRep.value.teams[0].players.length > 1;
                        let explanation = bingodefinitions_1.default[bingotype];
                        if (explanation) {
                            if (isCoop) {
                                explanation += bingodefinitions_1.default.coop;
                            }
                            client.say(channel, explanation)
                                .catch((e) => log.error('', e));
                        }
                    }
                }
            }
            /* also custom chatbot stuff not used
                if (chatCommandsRep.value.hasOwnProperty(userCommandName)) {
                    var userCommand = chatCommandsRep.value[userCommandName];
                    if (userCommand &&
                        userCommand.enabled &&
                        (new Date().getTime() - userCommand.lastUsed) > userCommand.cooldown) {
                            client.say(channel, userCommand.response);
                            userCommand.lastUsed = new Date().getTime();
                    }
                } */
        }
        let tokenRefreshed = false;
        function connectBot(attempts) {
            client.connect().catch(err => {
                log.error(`failed connect attempt ${attempts}`, err);
                if (attempts < 10) {
                    setTimeout(() => connectBot(attempts + 1), 5000);
                }
            }).then(() => {
                client.on('message', messageHandler);
                client.join(twichAPIDataRep.value.channelName || 'speedrunslive')
                    .catch((reason) => {
                    log.error(`Couldn't join channel: ${reason}`);
                }).then((data) => {
                    log.info(`Joined channel: ${data}`);
                });
            });
        }
        connectBot(0);
    });
}
