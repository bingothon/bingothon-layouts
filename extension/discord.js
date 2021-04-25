"use strict";
// source: https://github.com/TreZc0/kiio-podcast
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
// TODO refactor this
/* eslint-disable @typescript-eslint/no-use-before-define, no-inner-declarations */
// Imports
const Discord = __importStar(require("discord.js"));
const stream_1 = require("stream");
const nodecgApiContext = __importStar(require("./util/nodecg-api-context"));
const nodecg = nodecgApiContext.get();
// NodeCG
const log = new nodecg.Logger(`${nodecg.bundleName}:discord`);
const voiceActivity = nodecg.Replicant('voiceActivity', {
    defaultValue: {
        members: [],
    },
    persistent: true,
});
// delay in ms
const voiceDelayRep = nodecg.Replicant('voiceDelay', { defaultValue: 0, persistent: true });
// Discord API
const bot = new Discord.Client();
// config
const config = nodecg.bundleConfig;
const botToken = config.discord.token;
const botServerID = config.discord.serverID;
const botCommandChannelID = config.discord.commandChannelID;
const botVoiceCommentaryChannelID = config.discord.voiceChannelID;
if (!(botToken && botServerID && botCommandChannelID && botVoiceCommentaryChannelID)) {
    log.error('botToken, botServerID, botCommandChannelID, botVoiceCommentaryChannelID all have to be set!');
}
else {
    // Variables
    let voiceStatus = 'disconnected';
    // Connection
    bot.on('ready', () => {
        if (!bot.user) {
            log.error('bot user not set!!');
            return;
        }
        log.info('Logged in as %s - %s\n', bot.user.username, bot.user.id);
    });
    bot.on('error', () => {
        log.error('The bot encountered a connection error!!');
        voiceStatus = 'disconnected';
        setTimeout(() => {
            bot.login(botToken);
        }, 10000);
    });
    bot.on('disconnect', () => {
        log.error('The bot disconnected!!');
        voiceStatus = 'disconnected';
        setTimeout(() => {
            bot.login(botToken);
        }, 10000);
    });
    bot.login(botToken);
    // Voice
    bot.on('voiceStateUpdate', () => {
        UpdateCommentaryChannelMembers();
        // reconnect to voice channel on disconnect
        if (voiceStatus === 'disconnected') {
            joinVoiceChannel();
        }
    });
    function UpdateCommentaryChannelMembers() {
        if (!voiceActivity || !voiceActivity.value)
            return;
        const memberArray = getVoiceChannelSafe(botServerID, botVoiceCommentaryChannelID)
            .members.array();
        if (!memberArray || memberArray.length < 1) {
            voiceActivity.value.members = [];
            return;
        }
        const newVoiceArray = [];
        memberArray.forEach((voiceMember) => {
            // Hide our bot and muted members cause that is the restreamer
            if (config.discord.ignoredUsers
                && config.discord.ignoredUsers.includes(voiceMember.user.tag)) {
                return;
            }
            if (!voiceMember.voice.selfMute) {
                let userAvatar = voiceMember.user.avatarURL();
                if (!userAvatar || userAvatar === null) {
                    userAvatar = 'https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png';
                } // Default avatar
                let speakStatus = voiceMember.voice.speaking;
                if (!speakStatus || speakStatus === null) {
                    speakStatus = false;
                }
                log.info(`${voiceMember.displayName} has changed their speaking status: ${speakStatus}`);
                newVoiceArray.push({
                    id: voiceMember.user.id,
                    name: voiceMember.displayName,
                    avatar: userAvatar,
                    isSpeaking: speakStatus,
                });
            }
        });
        voiceActivity.value.members = newVoiceArray;
    }
    function joinVoiceChannel() {
        voiceStatus = 'connecting';
        getVoiceChannelSafe(botServerID, botVoiceCommentaryChannelID)
            .join().then((connection) => {
            voiceStatus = 'connected';
            class Silence extends stream_1.Readable {
                // eslint-disable-next-line no-underscore-dangle
                _read() {
                    this.push(Buffer.from([0xF8, 0xFF, 0xFE]));
                }
            }
            connection.play(new Silence(), { type: 'opus' });
            UpdateCommentaryChannelMembers();
            nodecg.log.info('joined voice channel!');
            connection.on('speaking', (user, speaking) => {
                // nodecg.log.info(`updating user ${user.tag} to speaking`);
                if (!voiceActivity.value.members || voiceActivity.value.members.length < 1) {
                    return;
                }
                setTimeout(() => {
                    voiceActivity.value.members.find((voiceMember) => {
                        if (voiceMember === undefined || user === undefined) {
                            return false;
                        }
                        if (voiceMember.id === user.id) {
                            // Delay this by streamleader delay/current obs
                            // timeshift delay if its activated with setTimeout
                            // eslint-disable-next-line no-param-reassign
                            voiceMember.isSpeaking = speaking.has(Discord.Speaking.FLAGS.SPEAKING);
                            return true;
                        }
                        return false;
                    });
                }, voiceDelayRep.value);
            });
        });
    }
    // Commands
    function commandChannel(message) {
        // ADMIN COMMANDS
        if (message.content.toLowerCase() === '!commands') {
            message.reply('ADMIN: [!bot join | !bot leave]');
        }
        else if (message.content.toLowerCase() === '!bot join') {
            if (voiceStatus !== 'disconnected') {
                message.reply('I already entered the podcast channel!');
                return;
            }
            joinVoiceChannel();
        }
        else if (message.content.toLowerCase() === '!bot leave') {
            if (voiceStatus !== 'connected') {
                message.reply('I\'m not in the podcast channel!');
                return;
            }
            getVoiceChannelSafe(botServerID, botVoiceCommentaryChannelID).leave();
            voiceStatus = 'disconnected';
        }
    }
    // Message Handling
    bot.on('message', (message) => {
        if (message.channel.id === botCommandChannelID) {
            commandChannel(message);
            return;
        }
        if (message.content.toLowerCase() === '!status') {
            message.reply('Hey! I\'m online and ready to track the voice channel!');
        }
    });
    // helper
    function getVoiceChannelSafe(serverID, voiceChannelID) {
        const guild = bot.guilds.cache.get(serverID);
        if (guild === undefined) {
            throw new Error('Discord Guild-ID is invalid!');
        }
        const channel = guild.channels.cache.get(voiceChannelID);
        if (channel === undefined) {
            throw new Error('Discord Voice channel ID is invalid!');
        }
        if (!(channel instanceof Discord.VoiceChannel)) {
            throw new Error('Discord Channel is not a voice channel!');
        }
        return channel;
    }
}
