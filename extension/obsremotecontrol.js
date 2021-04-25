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
Object.defineProperty(exports, "__esModule", { value: true });
const nodecgApiContext = __importStar(require("./util/nodecg-api-context"));
// this handles dashboard utilities, all around automating the run setup process
// and setting everything in OBS properly ontransitions
// this uses the transparent bindings form the obs.ts in util
const nodecg = nodecgApiContext.get();
const logger = new nodecg.Logger(`${nodecg.bundleName}:remotecontrol`);
const bundleConfig = nodecg.bundleConfig;
const obsCurrentSceneRep = nodecg.Replicant('obsCurrentScene');
const obsDashboardAudioSourcesRep = nodecg.Replicant('obsDashboardAudioSources');
const obsAudioSourcesRep = nodecg.Replicant('obsAudioSources');
const obsConnectionRep = nodecg.Replicant('obsConnection');
const obsStreamModeRep = nodecg.Replicant('obsStreamMode');
const discordDelayInfoRep = nodecg.Replicant('discordDelayInfo');
const currentGameLayoutRep = nodecg.Replicant('currentGameLayout');
const currentInterviewLayoutRep = nodecg.Replicant('currentInterview');
const runDataActiveRunRep = nodecg.Replicant('runDataActiveRun', 'nodecg-speedcontrol');
const voiceDelayRep = nodecg.Replicant('voiceDelay', { defaultValue: 0, persistent: true });
const streamsReplicant = nodecg.Replicant('twitchStreams', { defaultValue: [] });
const soundOnTwitchStream = nodecg.Replicant('soundOnTwitchStream', { defaultValue: -1 });
const hostDiscordDuringIntermissionRep = nodecg.Replicant('hostsSpeakingDuringIntermission');
const lastIntermissionTimestampRep = nodecg.Replicant('lastIntermissionTimestamp');
// make sure we are connected to OBS before loading any of the functions that depend on OBS
function waitTillConnected() {
    return new Promise((resolve) => {
        function conWait(val) {
            if (val.status === 'connected') {
                obsConnectionRep.removeListener('change', conWait);
                resolve();
            }
        }
        obsConnectionRep.on('change', conWait);
    });
}
waitTillConnected().then(() => {
    logger.info('connected to OBS, setting up remote control utils...');
    // default if they somehow not exist
    [bundleConfig.obs.discordAudio, bundleConfig.obs.mpdAudio, bundleConfig.obs.streamsAudio]
        .forEach((audioSource) => {
        if (!Object.getOwnPropertyNames(obsDashboardAudioSourcesRep.value).includes(audioSource)) {
            obsDashboardAudioSourcesRep.value[audioSource] = { baseVolume: 0.5, fading: 'unmuted' };
        }
    });
    obsDashboardAudioSourcesRep.on('change', (newVal, old) => {
        if (old === undefined || newVal === null || newVal === old) {
            // if a fading was aborted by the server crashing, make sure it's leaving that state now
            Object.values(obsDashboardAudioSourcesRep.value).forEach((soundState) => {
                if (['fadein', 'fadeout'].includes(soundState.fading)) {
                    soundState.fading = 'muted'; // eslint-disable-line no-param-reassign
                }
            });
            return;
        }
        Object.entries(newVal).forEach(([source, soundState]) => {
            const oldSound = old[source];
            // don't do anything if currently transitioning
            if (soundState.fading === 'fadein' || soundState.fading === 'fadeout') {
                return;
            }
            if (!oldSound || oldSound.baseVolume !== soundState.baseVolume) {
                logger.info(`setting volume for ${source} to ${soundState.baseVolume}`);
                obsAudioSourcesRep.value[source].volume = soundState.baseVolume;
            }
            if (!oldSound || oldSound.fading !== soundState.fading) {
                obsAudioSourcesRep.value[source].muted = (soundState.fading === 'muted');
            }
        });
    });
    nodecg.listenFor('obsRemotecontrol:fadeOutAudio', (data, callback) => {
        data = data || {}; // eslint-disable-line no-param-reassign
        const { source } = data;
        if (!source) {
            if (callback && !callback.handled) {
                callback('No source given!');
            }
            return;
        }
        // make sure the source exists
        if (!Object.keys(obsDashboardAudioSourcesRep.value).includes(source)) {
            if (callback && !callback.handled) {
                callback(`Source ${source} doesn't exist!`);
                return;
            }
        }
        // can only fade out if currently unmuted
        if (obsDashboardAudioSourcesRep.value[source].fading !== 'unmuted') {
            if (callback && !callback.handled) {
                callback();
            }
            return;
        }
        obsDashboardAudioSourcesRep.value[source].fading = 'fadeout';
        let currentVol = obsDashboardAudioSourcesRep.value[source].baseVolume;
        obsAudioSourcesRep.value[source].muted = false;
        function doFadeOut() {
            currentVol = Math.max(currentVol - 0.05, 0);
            obsAudioSourcesRep.value[source].volume = currentVol;
            if (currentVol > 0) {
                setTimeout(doFadeOut, 100);
            }
            else {
                obsDashboardAudioSourcesRep.value[source].fading = 'muted';
                if (callback && !callback.handled) {
                    callback();
                }
            }
        }
        setTimeout(doFadeOut, 100);
    });
    nodecg.listenFor('obsRemotecontrol:fadeInAudio', (data, callback) => {
        data = data || {}; // eslint-disable-line no-param-reassign
        const { source } = data;
        if (!source) {
            if (callback && !callback.handled) {
                callback('No source given!');
                return;
            }
        }
        // make sure the source exists
        if (!Object.keys(obsDashboardAudioSourcesRep.value).includes(source)) {
            if (callback && !callback.handled) {
                callback(`Source ${source} doesn't exist!`);
                return;
            }
        }
        // can only fade in if muted
        if (obsDashboardAudioSourcesRep.value[source].fading !== 'muted') {
            if (callback && !callback.handled) {
                callback();
            }
            return;
        }
        obsDashboardAudioSourcesRep.value[source].fading = 'fadein';
        obsAudioSourcesRep.value[source].muted = false;
        let currentVol = 0;
        function doFadeIn() {
            const goalVol = obsDashboardAudioSourcesRep.value[source].baseVolume;
            currentVol = Math.min(goalVol, currentVol + 0.05);
            obsAudioSourcesRep.value[source].volume = currentVol;
            if (currentVol < goalVol) {
                setTimeout(doFadeIn, 100);
            }
            else {
                obsDashboardAudioSourcesRep.value[source].fading = 'unmuted';
            }
        }
        setTimeout(doFadeIn, 100);
    });
    /* eslint-disable max-len */
    // update discord display and audio delays to the stream leader delay for the specified delay info
    function updateDiscordDelays(streamLeaderDelayMs, discordDelayInfo) {
        if (discordDelayInfo.discordAudioDelaySyncStreamLeader && streamLeaderDelayMs !== null) {
            if (Math.abs(obsAudioSourcesRep.value[bundleConfig.obs.discordAudio].delay - streamLeaderDelayMs) > 1000) {
                obsAudioSourcesRep.value[bundleConfig.obs.discordAudio].delay = streamLeaderDelayMs;
                if (discordDelayInfo.discordDisplayDelaySyncStreamLeader) {
                    voiceDelayRep.value = streamLeaderDelayMs;
                }
            }
        }
        else {
            obsAudioSourcesRep.value[bundleConfig.obs.discordAudio].delay = discordDelayInfo.discordAudioDelayMs;
        }
        // already handled
        if (discordDelayInfo.discordDisplayDelaySyncStreamLeader && !discordDelayInfo.discordAudioDelaySyncStreamLeader
            && streamLeaderDelayMs !== null) {
            voiceDelayRep.value = streamLeaderDelayMs;
        }
        else {
            voiceDelayRep.value = discordDelayInfo.discordDisplayDelayMs;
        }
    }
    discordDelayInfoRep.on('change', (newVal) => {
        let streamLeaderDelayMs = null;
        if (soundOnTwitchStream.value !== -1) {
            streamLeaderDelayMs = (streamsReplicant.value[soundOnTwitchStream.value] || {}).delay || null;
        }
        updateDiscordDelays(streamLeaderDelayMs, newVal);
    });
    soundOnTwitchStream.on('change', (newVal) => {
        if (newVal === -1) {
            return;
        }
        const stream = streamsReplicant.value[newVal];
        if (stream !== undefined) {
            updateDiscordDelays(stream.delay, discordDelayInfoRep.value);
        }
    });
    streamsReplicant.on('change', (newVal) => {
        if (soundOnTwitchStream.value === -1) {
            return;
        }
        const stream = newVal[soundOnTwitchStream.value];
        if (stream !== undefined) {
            updateDiscordDelays(stream.delay, discordDelayInfoRep.value);
        }
    });
    function handleScreenStreamModeChange(streamMode, nextSceneName) {
        nextSceneName = nextSceneName.toLowerCase(); // eslint-disable-line no-param-reassign
        const hostsSpeaking = hostDiscordDuringIntermissionRep.value.speaking;
        logger.info(`handling stream mode ${streamMode} in scene ${nextSceneName}`);
        // music only during intermission
        if (nextSceneName === 'intermission') {
            // updates the next run panels
            nodecg.sendMessage('forceRefreshIntermission');
            nodecg.sendMessage('obsRemotecontrol:fadeInAudio', { source: bundleConfig.obs.mpdAudio }, (err) => {
                logger.warn(`Problem fading in mpd during transition: ${err.error}`);
            });
        }
        else {
            // this should be false anyway, hosts should stop speaking before the transition to the next run
            hostDiscordDuringIntermissionRep.value.speaking = false;
            nodecg.sendMessage('obsRemotecontrol:fadeOutAudio', { source: bundleConfig.obs.mpdAudio }, (err) => {
                logger.warn(`Problem fading out mpd during transition: ${err.error}`);
            });
        }
        // use player audio
        if (nextSceneName === 'game') {
            nodecg.sendMessage('obsRemotecontrol:fadeInAudio', { source: bundleConfig.obs.streamsAudio }, (err) => {
                logger.warn(`Problem fading in streams during transition: ${err.error}`);
            });
        }
        else {
            nodecg.sendMessage('obsRemotecontrol:fadeOutAudio', { source: bundleConfig.obs.streamsAudio }, (err) => {
                logger.warn(`Problem fading out streams during transition: ${err.error}`);
            });
        }
        // depending on the next scene and which mode is used set some stuff automagically
        if (streamMode === 'external-commentary' || streamMode === 'runner-commentary') {
            // no discord delay in intermission
            // if commentary is external no delay is necessary
            if (nextSceneName === 'intermission' || streamMode === 'external-commentary') {
                discordDelayInfoRep.value.discordAudioDelaySyncStreamLeader = false;
                discordDelayInfoRep.value.discordDisplayDelaySyncStreamLeader = false;
            }
            else {
                discordDelayInfoRep.value.discordAudioDelaySyncStreamLeader = true;
                discordDelayInfoRep.value.discordDisplayDelaySyncStreamLeader = true;
            }
            // if the next scene isn't intermission unmute discord, also don't fade out if hosts are speaking
            if (nextSceneName === 'intermission' && !hostsSpeaking) {
                nodecg.sendMessage('obsRemotecontrol:fadeOutAudio', { source: bundleConfig.obs.discordAudio }, (err) => {
                    logger.warn(`Problem fading out discord during transition: ${err.error}`);
                });
            }
            else {
                nodecg.sendMessage('obsRemotecontrol:fadeInAudio', { source: bundleConfig.obs.discordAudio }, (err) => {
                    logger.warn(`Problem fading in discord during transition: ${err.error}`);
                });
            }
        }
        else if (streamMode === 'racer-audio-only') {
            // use player audio
            if (nextSceneName === 'game') {
                nodecg.sendMessage('obsRemotecontrol:fadeInAudio', { source: bundleConfig.obs.streamsAudio }, (err) => {
                    logger.warn(`Problem fading in streams during transition: ${err.error}`);
                });
            }
            else {
                nodecg.sendMessage('obsRemotecontrol:fadeOutAudio', { source: bundleConfig.obs.streamsAudio }, (err) => {
                    logger.warn(`Problem fading out streams during transition: ${err.error}`);
                });
            }
            // discord muted exept for interview
            if (nextSceneName === 'interview' || (nextSceneName === 'intermission' && hostsSpeaking)) {
                nodecg.sendMessage('obsRemotecontrol:fadeInAudio', { source: bundleConfig.obs.discordAudio }, (err) => {
                    logger.warn(`Problem fading in discord during transition: ${err.error}`);
                });
            }
            else {
                nodecg.sendMessage('obsRemotecontrol:fadeOutAudio', { source: bundleConfig.obs.discordAudio }, (err) => {
                    logger.warn(`Problem fading out discord during transition: ${err.error}`);
                });
            }
            if (nextSceneName === 'intermission') {
                discordDelayInfoRep.value.discordDisplayDelaySyncStreamLeader = false;
                discordDelayInfoRep.value.discordAudioDelaySyncStreamLeader = false;
            }
            else {
                discordDelayInfoRep.value.discordDisplayDelaySyncStreamLeader = true;
                discordDelayInfoRep.value.discordAudioDelaySyncStreamLeader = true;
            }
        }
        else {
            logger.error(`Unknown stream configuration: ${streamMode}`);
        }
    }
    /* eslint-enable max-len */
    obsStreamModeRep.on('change', (newVal, old) => {
        // no value is most likely server restart
        if (!old)
            return;
        // change in current scene
        handleScreenStreamModeChange(newVal, obsCurrentSceneRep.value || '');
    });
    nodecg.listenFor('obs:startingTransition', (data) => {
        logger.info('catched transition starting', data);
        const nextScene = (data || {}).scene || '';
        if (nextScene === 'intermission') {
            // update last intermission time
            lastIntermissionTimestampRep.value = new Date().getTime() / 1000;
        }
        handleScreenStreamModeChange(obsStreamModeRep.value, nextScene);
    });
    hostDiscordDuringIntermissionRep.on('change', (newVal, old) => {
        // no value is most likely server restart
        if (!old)
            return;
        // nothing changed
        if (newVal.speaking === old.speaking)
            return;
        if ((obsCurrentSceneRep.value || '').toLowerCase() !== 'intermission') {
            // only accepted during intermission
            hostDiscordDuringIntermissionRep.value.speaking = false;
        }
    });
    runDataActiveRunRep.on('change', (newValue, old) => {
        // bail on server restart
        if (!newValue || !old)
            return;
        // set layout defaults only in intermission
        if ((obsCurrentSceneRep.value || '').toLowerCase() === 'intermission') {
            let playerCount = 0;
            for (let i = 0; i < newValue.teams.length; i += 1) {
                const team = newValue.teams[i];
                // eslint-disable-next-line no-loop-func
                team.players.forEach(() => {
                    playerCount += 1;
                });
            }
            currentGameLayoutRep.value.name = `${playerCount}p ${newValue.customData.Layout} Layout`;
            currentInterviewLayoutRep.value.name = `${playerCount}p Interview`;
        }
    });
    hostDiscordDuringIntermissionRep.on('change', (newVal) => {
        if ((obsCurrentSceneRep.value || '').toLowerCase() === 'intermission') {
            if (newVal.speaking) {
                nodecg.sendMessage('obsRemotecontrol:fadeInAudio', { source: bundleConfig.obs.discordAudio }, (err) => {
                    logger.warn(`Problem fading in discord during transition: ${err.error}`);
                });
            }
            else {
                nodecg.sendMessage('obsRemotecontrol:fadeOutAudio', { source: bundleConfig.obs.discordAudio }, (err) => {
                    logger.warn(`Problem fading out discord during transition: ${err.error}`);
                });
            }
        }
    });
});
