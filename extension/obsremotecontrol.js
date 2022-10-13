"use strict";
'use-strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
const nodecgApiContext = __importStar(require("./util/nodecg-api-context"));
const obs_1 = __importDefault(require("./util/obs"));
// this handles dashboard utilities, all around automating the run setup process
// and setting everything in OBS properly on transitions
// this uses the transparent bindings form the obs.ts in util
const HOST_SPEAKING_MUSIC_VOLUME_MULTIPLIER = 0.2;
const nodecg = nodecgApiContext.get();
const logger = new nodecg.Logger(`${nodecg.bundleName}:remotecontrol`);
const bundleConfig = nodecg.bundleConfig;
const obsCurrentSceneRep = nodecg.Replicant('obsCurrentScene');
const obsDashboardAudioSourcesRep = nodecg.Replicant('obsDashboardAudioSources');
const obsAudioSourcesRep = nodecg.Replicant('obsAudioSources');
const obsConnectionRep = nodecg.Replicant('obsConnection');
const obsStreamModeRep = nodecg.Replicant('obsStreamMode');
const discordDelayInfoRep = nodecg.Replicant('discordDelayInfo');
const voiceDelayRep = nodecg.Replicant('voiceDelay', { defaultValue: 0, persistent: true });
const streamsReplicant = nodecg.Replicant('twitchStreams', { defaultValue: [] });
const soundOnTwitchStream = nodecg.Replicant('soundOnTwitchStream', { defaultValue: -1 });
const hostDiscordDuringIntermissionRep = nodecg.Replicant('hostsSpeakingDuringIntermission');
const lastIntermissionTimestampRep = nodecg.Replicant('lastIntermissionTimestamp');
const obsPreviewImgRep = nodecg.Replicant('obsPreviewImg');
let screenshotTimer = undefined;
// intermission (ads or no), VideoPlayer
function isIntermissionLikeScene(name) {
    return name.toLowerCase().includes('intermission') || name.toLowerCase() == 'videoplayer';
}
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
    function doTakeSourceScreenshot() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!obsPreviewImgRep.value.active || !obsPreviewImgRep.value.source)
                return;
            try {
                const imgData = yield obs_1.default.takeSourceScreenshot(obsPreviewImgRep.value.source);
                obsPreviewImgRep.value.screenshot = imgData;
            }
            catch (e) {
                logger.error("error taking screenshot: ", e);
            }
        });
    }
    obsPreviewImgRep.on('change', (newVal, oldVal) => {
        if (!oldVal || oldVal.active !== newVal.active) {
            // clear even before activating, just to be sure
            if (screenshotTimer) {
                clearInterval(screenshotTimer);
            }
            if (newVal.active) {
                screenshotTimer = setInterval(doTakeSourceScreenshot, 1000);
            }
        }
    });
    nodecg.listenFor('obsremotecontrol:setPreviewImgActive', (data, cb) => {
        const { active } = data || {};
        if (active !== undefined) {
            obsPreviewImgRep.value.active = !!active;
            if (cb && !cb.handled) {
                cb();
                return;
            }
        }
        else {
            if (cb && !cb.handled) {
                cb('active has to be a boolean!');
                return;
            }
        }
    });
    nodecg.listenFor('obsremotecontrol:setPreviewImgSource', (data, cb) => {
        const { source } = data || {};
        if (source !== undefined && typeof source === 'string') {
            obsPreviewImgRep.value.source = source;
            if (cb && !cb.handled) {
                cb();
                return;
            }
        }
        else {
            if (cb && !cb.handled) {
                cb('source has to be a string!');
                return;
            }
        }
    });
    nodecg.listenFor('obsRemotecontrol:fadeInAudio', (data, callback) => {
        const { source } = data || {};
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
        if (nextSceneName.includes('intermission')) {
            // updates the next run panels
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
        // streams audio handled via individual sources
        // if (nextSceneName === 'game') {
        //   nodecg.sendMessage('obsRemotecontrol:fadeInAudio', { source: bundleConfig.obs.streamsAudio }, (err): void => {
        //     logger.warn(`Problem fading in streams during transition: ${err.error}`);
        //   });
        // } else {
        //   nodecg.sendMessage('obsRemotecontrol:fadeOutAudio', { source: bundleConfig.obs.streamsAudio }, (err): void => {
        //     logger.warn(`Problem fading out streams during transition: ${err.error}`);
        //   });
        // }
        // depending on the next scene and which mode is used set some stuff automagically
        if (streamMode === 'external-commentary' || streamMode === 'runner-commentary') {
            // no discord delay in intermission
            // if commentary is external no delay is necessary
            // if (nextSceneName.includes('intermission') || streamMode === 'external-commentary') {
            //   discordDelayInfoRep.value.discordAudioDelaySyncStreamLeader = false;
            //   discordDelayInfoRep.value.discordDisplayDelaySyncStreamLeader = false;
            // } else {
            //   discordDelayInfoRep.value.discordAudioDelaySyncStreamLeader = false; // there is no stream leader delay anymore
            //   discordDelayInfoRep.value.discordDisplayDelaySyncStreamLeader = false;
            // }
            // if the next scene isn't intermission unmute discord, also don't fade out if hosts are speaking
            if (isIntermissionLikeScene(nextSceneName) && !hostsSpeaking) {
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
            // streams audio handled via individual sources
            // if (nextSceneName === 'game') {
            //   nodecg.sendMessage('obsRemotecontrol:fadeInAudio', { source: bundleConfig.obs.streamsAudio }, (err): void => {
            //     logger.warn(`Problem fading in streams during transition: ${err.error}`);
            //   });
            // } else {
            //   nodecg.sendMessage('obsRemotecontrol:fadeOutAudio', { source: bundleConfig.obs.streamsAudio }, (err): void => {
            //     logger.warn(`Problem fading out streams during transition: ${err.error}`);
            //   });
            // }
            // discord muted except for interview
            if (nextSceneName === 'interview' || (nextSceneName.includes('intermission') && hostsSpeaking)) {
                nodecg.sendMessage('obsRemotecontrol:fadeInAudio', { source: bundleConfig.obs.discordAudio }, (err) => {
                    logger.warn(`Problem fading in discord during transition: ${err.error}`);
                });
            }
            else {
                nodecg.sendMessage('obsRemotecontrol:fadeOutAudio', { source: bundleConfig.obs.discordAudio }, (err) => {
                    logger.warn(`Problem fading out discord during transition: ${err.error}`);
                });
            }
            // if (nextSceneName === 'intermission') {
            //   discordDelayInfoRep.value.discordDisplayDelaySyncStreamLeader = false;
            //   discordDelayInfoRep.value.discordAudioDelaySyncStreamLeader = false;
            // } else {
            //   discordDelayInfoRep.value.discordDisplayDelaySyncStreamLeader = false; // not used anymore, so just use false
            //   discordDelayInfoRep.value.discordAudioDelaySyncStreamLeader = false;
            // }
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
        if (isIntermissionLikeScene(nextScene)) {
            // update last intermission time
            lastIntermissionTimestampRep.value = new Date().getTime() / 1000;
        }
        logger.info(`going to ${nextScene}`);
        if (nextScene === 'game') {
            nodecg.sendMessage('forceRefreshIntermission');
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
        if (!(obsCurrentSceneRep.value || '').toLowerCase().includes('intermission')) {
            // only accepted during intermission
            hostDiscordDuringIntermissionRep.value.speaking = false;
        }
    });
    hostDiscordDuringIntermissionRep.on('change', (newVal) => {
        if ((obsCurrentSceneRep.value || '').toLowerCase().includes('intermission')) {
            if (newVal.speaking) {
                obsAudioSourcesRep.value[bundleConfig.obs.mpdAudio].volumeMultiplier = HOST_SPEAKING_MUSIC_VOLUME_MULTIPLIER;
                nodecg.sendMessage('obsRemotecontrol:fadeInAudio', { source: bundleConfig.obs.discordAudio }, (err) => {
                    logger.warn(`Problem fading in discord during transition: ${err.error}`);
                });
            }
            else {
                obsAudioSourcesRep.value[bundleConfig.obs.mpdAudio].volumeMultiplier = 1;
                nodecg.sendMessage('obsRemotecontrol:fadeOutAudio', { source: bundleConfig.obs.discordAudio }, (err) => {
                    logger.warn(`Problem fading out discord during transition: ${err.error}`);
                });
            }
        }
    });
    //triggers ads when switching to Ad scene
    const adsTimerReplicant = nodecg.Replicant('twitchCommercialTimer', 'nodecg-speedcontrol');
    obs_1.default.on('CurrentProgramSceneChanged', ({ sceneName }) => __awaiter(void 0, void 0, void 0, function* () {
        if (sceneName.startsWith('(ads) intermission')
            && adsTimerReplicant.value && adsTimerReplicant.value.secondsRemaining <= 0) {
            //play ads
            nodecg.sendMessageToBundle('twitchStartCommercial', 'nodecg-speedcontrol', { duration: 180 });
            nodecg.log.info('Playing 3 minute Twitch Ad');
        }
    }));
    adsTimerReplicant.on('change', (newVal) => {
        if (newVal.secondsRemaining <= 0 && obsCurrentSceneRep.value === '(ads) intermission') {
            obs_1.default.changeScene('videoPlayer');
            nodecg.sendMessage('obsRemotecontrol:fadeOutAudio', { source: bundleConfig.obs.mpdAudio }, (err) => {
                logger.warn(`Problem fading out mpd during transition: ${err.error}`);
            });
        }
    });
    nodecg.listenFor('videoPlayerFinished', () => {
        var _a;
        if (((_a = obsCurrentSceneRep.value) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'videoplayer') {
            obs_1.default.changeScene('intermission');
            nodecg.sendMessage('obsRemotecontrol:fadeInAudio', { source: bundleConfig.obs.mpdAudio }, (err) => {
                logger.warn(`Problem fading in mpd during transition: ${err.error}`);
            });
        }
    });
});
