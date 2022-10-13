"use strict";
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
const obs_websocket_js_1 = __importDefault(require("obs-websocket-js"));
const nodecgApiContext = __importStar(require("./nodecg-api-context"));
// this module is used to communicate directly with OBS
// and transparently handle:
//  - audio volume/mute/delay
//  - preview and current scene
//  - transitions
const nodecg = nodecgApiContext.get();
const logger = new nodecg.Logger(`${nodecg.bundleName}:obs`);
const bundleConfig = nodecg.bundleConfig;
;
function getStreamSrcName(idx) {
    return `twitch-stream-${idx}`;
}
function handleStreamPosChange(obs, stream, streamIdx, currentGameLayout, capturePositions) {
    const layoutName = currentGameLayout.path.slice(1); // leading slash we don't want
    const captureLayout = capturePositions[layoutName];
    if (captureLayout === undefined) {
        logger.error(`capture layout ${layoutName} not found!`);
        return;
    }
    const capturePos = captureLayout[`stream${streamIdx + 1}`];
    if (capturePos === undefined) {
        obs.setSourceBoundsAndCrop(getStreamSrcName(streamIdx), { visible: false });
        logger.error(`capture pos for index ${streamIdx} not found on ${layoutName}!`);
        return;
    }
    // calculate cropping, the browser source is fixed to 1920x1080
    const cropLeft = 1920 * -stream.leftPercent / 100;
    const cropTop = 1080 * -stream.topPercent / 100;
    const cropRight = 1920 * (1 - 100 / stream.widthPercent) - cropLeft;
    const cropBottom = 1080 * (1 - 100 / stream.heightPercent) - cropTop;
    // fire and forget
    obs.setSourceBoundsAndCrop(getStreamSrcName(streamIdx), {
        cropLeft, cropTop, cropRight, cropBottom, visible: true,
        x: capturePos.x,
        y: capturePos.y,
        width: capturePos.width,
        height: capturePos.height,
    });
}
function handleSoundChange(obs, soundOnTwitchStream, streamIdx, newStream, oldStream) {
    obs.setAudioMute(getStreamSrcName(streamIdx), soundOnTwitchStream !== streamIdx);
    if (newStream.volume !== oldStream.volume) {
        obs.setAudioVolume(getStreamSrcName(streamIdx), newStream.volume);
    }
}
// Extending the OBS library with some of our own functions.
class OBSUtility extends obs_websocket_js_1.default {
    /**
     * Change to this OBS scene.
     * @param name Name of the scene.
     */
    changeScene(name) {
        return new Promise((resolve, reject) => {
            this.call('SetCurrentProgramScene', { sceneName: name }).then(resolve).catch((err) => {
                logger.warn(`Cannot change OBS scene [${name}]: ${err}`);
                reject(err);
            });
        });
    }
    /**
     * Get the Volume for a source
     * @param source Name of the source which volume should be changed
     */
    getAudioVolume(source) {
        return new Promise((resolve, reject) => {
            this.call('GetInputVolume', { inputName: source }).then((resp) => {
                resolve(resp.inputVolumeMul);
            }).catch((err) => {
                reject(err);
            });
        });
    }
    /**
     * Set volume for a source
     * @param source Source which volume is changed
     * @param volume Volume from 0.0 to 1.0 (inclusive)
     */
    setAudioVolume(source, volume) {
        return new Promise((resolve, reject) => {
            this.call('SetInputVolume', { inputName: source, inputVolumeMul: volume }).then(resolve).catch((err) => {
                // logger.warn(`Cannot set volume [${source}]: ${err.error}`);
                reject(err);
            });
        });
    }
    /**
     * Set volume for a source
     * @param source Source which volume is muted/unmuted
     * @param mute boolean
     */
    setAudioMute(source, mute) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield this.call('SetInputMute', { inputName: source, inputMuted: mute }).catch((err) => {
                reject(err);
            });
        }));
    }
    /**
     * Update the played input from a media source
     * @param source name of the media source
     * @param url link to the stream that ffmpeg can handle, get from streamlink
     */
    setMediasourceUrl(source, url) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.call("SetInputSettings", {
                inputName: source,
                //sourceType: "ffmpeg_source", // just to make sure
                inputSettings: {
                    input: url,
                    is_local_file: false,
                }
            }).catch(e => logger.error('could not set source settings', e));
        });
    }
    /**
     * Play or pause a media source
     * @param source name of the media source
     * @param pause whether the source should be paused now, false starts the source
     */
    setMediasourcePlayPause(source, pause) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: remove this garbage once obs-websocket-js updates to proper bindings
            // const mediaStatus = await obs.call('GetMediaInputStatus', { inputName: source })
            // logger.warn(mediaStatus)
            if (pause) {
                //logger.warn(`setting ${source} to paused`)
                yield this.call("TriggerMediaInputAction", {
                    inputName: source,
                    mediaAction: 'OBS_MEDIA_PAUSE_PLAY', // TODO: Might not be a correct media action..
                }).catch((e) => logger.error('could not set play pause', e));
            }
        });
    }
    refreshMediasource(source) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: remove this garbage once obs-websocket-js updates to proper bindings
            console.log(`triggered refresh for source ${source}`);
            yield this.send("RestartMedia", {
                sourceName: source,
            }).catch((e) => logger.error('could not restart media', e));
        });
    }
    setSourceBoundsAndCrop(source, params) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(`updating source ${source}: ` + JSON.stringify(params));
            const sceneItem = yield this.call("GetSceneItemId", {
                sceneName: bundleConfig.obs.gameScene || 'game',
                sourceName: source
            }).catch(e => logger.error('could not get GetSceneItemId', e));
            //const sceneTransform = await obs.call('GetSceneItemTransform', { sceneName: bundleConfig.obs.gameScene || 'game', sceneItemId: sceneItem!.sceneItemId })
            //logger.warn(sceneTransform) 
            if (params.visible) {
                yield this.call("SetSceneItemEnabled", { sceneName: bundleConfig.obs.gameScene || 'game', sceneItemId: sceneItem.sceneItemId, sceneItemEnabled: true });
            }
            else {
                yield this.call("SetSceneItemEnabled", { sceneName: bundleConfig.obs.gameScene || 'game', sceneItemId: sceneItem.sceneItemId, sceneItemEnabled: false });
            }
            yield this.call("SetSceneItemTransform", {
                sceneName: bundleConfig.obs.gameScene || 'game',
                sceneItemId: sceneItem.sceneItemId,
                sceneItemTransform: {
                    boundsHeight: params.height,
                    boundsType: 'OBS_BOUNDS_SCALE_INNER',
                    boundsWidth: params.width,
                    cropBottom: params.cropBottom,
                    cropLeft: params.cropLeft,
                    cropRight: params.cropRight,
                    cropTop: params.cropTop,
                    positionX: params.x,
                    positionY: params.y,
                    scaleX: 1,
                    scaleY: 1,
                }
                // example of the old object can be removed
                // sceneItemTransform: {
                //   position: {
                //     x: params.x,
                //     y: params.y,
                //   },
                //   bounds: {
                //     type: "OBS_BOUNDS_SCALE_INNER", // TODO: test
                //     x: params.width,
                //     y: params.height,
                //   },
                //   scale: {},
                //   visible: params.visible,
                //   crop: {
                //     bottom: params.cropBottom,
                //     left: params.cropLeft,
                //     right: params.cropRight,
                //     top: params.cropTop,
                //   },
                // }
            }).catch(e => logger.error('could not set source settings', e));
        });
    }
    setDefaultBrowserSettings(source) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.call("SetInputSettings", {
                inputName: source,
                inputSettings: {
                    height: 1080,
                    width: 1920,
                    fps: 30,
                    reroute_audio: true,
                }
            }).catch(e => logger.error('could not set browser defaults', e));
        });
    }
    setBrowserSourceUrl(source, url) {
        return __awaiter(this, void 0, void 0, function* () {
            // browser settings: "fps":28,"height":1080,"url":"https://obsproject.com/browser-source2","width":1920
            yield this.call("SetInputSettings", {
                inputName: source,
                inputSettings: {
                    url,
                }
            }).catch(e => logger.error('could not set browser source settings', e));
        });
    }
    refreshBrowserSource(source) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(`triggered refresh for source ${source}`);
            yield this.call("PressInputPropertiesButton", {
                inputName: source,
                propertyName: "refreshnocache"
            }).catch((e) => logger.error('could not refresh browser source', e));
        });
    }
    takeSourceScreenshot(source) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.call("GetSourceScreenshot", {
                imageFormat: "jpeg",
                sourceName: source,
                imageHeight: 300,
            }).catch(e => logger.error(`Could not make source screenshot from source: ${source}`, e));
            return response.imageData;
        });
    }
}
const obsConnectionRep = nodecg.Replicant('obsConnection');
const obs = new OBSUtility();
if (bundleConfig.obs && bundleConfig.obs.enable) {
    // local values to make sure there is no update loop
    const obsAudioSourcesRep = nodecg.Replicant('obsAudioSources');
    const obsPreviewSceneRep = nodecg.Replicant('obsPreviewScene', { defaultValue: null });
    const obsCurrentSceneRep = nodecg.Replicant('obsCurrentScene', { defaultValue: null });
    const obsSceneListRep = nodecg.Replicant('obsSceneList', { defaultValue: null }); // TODO: create a type Scene and replace 'any' with 'Scene[]'
    const capturePositionsRep = nodecg.Replicant('capturePositions');
    const currentGameLayoutRep = nodecg.Replicant('currentGameLayout');
    const soundOnTwitchStreamRep = nodecg.Replicant('soundOnTwitchStream');
    const twitchStreams = nodecg.Replicant('twitchStreams');
    const obsAudioLevels = nodecg.Replicant('obsAudioLevels');
    const settings = {
        url: bundleConfig.obs.address,
        password: bundleConfig.obs.password,
    };
    logger.info('Setting up OBS connection.');
    obsConnectionRep.value.status = 'disconnected';
    // eslint-disable-next-line no-inner-declarations
    function connect() {
        obs.connect(settings.url, settings.password).then(() => {
            logger.info('OBS connection successful.');
            obsConnectionRep.value.status = 'connected';
            // we need studio mode
            obs.call('GetStudioModeEnabled').then((enabled) => {
                if (!enabled) {
                    obs.call('SetStudioModeEnabled').catch((e) => {
                        logger.error("Can't set studio mode", e);
                    });
                }
            });
            // default if they somehow not exist
            [bundleConfig.obs.discordAudio, bundleConfig.obs.mpdAudio, bundleConfig.obs.streamsAudio]
                .forEach((audioSource) => {
                if (!Object.getOwnPropertyNames(obsAudioSourcesRep.value).includes(audioSource)) {
                    obsAudioSourcesRep.value[audioSource] = { volume: 0.5, muted: false, delay: 0, volumeMultiplier: 1 };
                }
            });
            obs.call('GetCurrentPreviewScene').then((scene) => {
                obsPreviewSceneRep.value = scene.currentPreviewSceneName;
            }).catch((err) => {
                logger.warn(`Cannot get preview scene: ${err.error}`);
            });
            obs.call('GetCurrentProgramScene').then((scene) => {
                obsCurrentSceneRep.value = scene.currentProgramSceneName;
            }).catch((err) => {
                logger.warn(`Cannot get current scene: ${err.error}`);
            });
            obs.call('GetSceneList').then((sceneList) => {
                obsSceneListRep.value = sceneList.scenes;
            }).catch((err) => {
                logger.warn(`Cannot get current scene list: ${err.error}`);
            });
            // obs default browser sources
            for (let i = 0; i < 4; i++) {
                obs.setDefaultBrowserSettings(getStreamSrcName(i));
            }
            twitchStreams.on('change', (newValue, old) => {
                if (!old)
                    return;
                for (let i = 0; i < 4; i++) {
                    const stream = newValue[i];
                    const oldStream = old[i] || {}; // old stream might be undefined
                    if (stream === undefined) {
                        // this stream should not be displayed
                        let transProps = {
                            visible: false,
                        };
                        // fire and forget
                        obs.setSourceBoundsAndCrop(getStreamSrcName(i), transProps);
                    }
                    else {
                        // check if the streamurl changed
                        if (stream.channel !== oldStream.channel) {
                            // fire and forget
                            obs.setBrowserSourceUrl(getStreamSrcName(i), `https://player.twitch.tv/?channel=${stream.channel}&enableExtensions=true&muted=false&parent=twitch.tv&player=popout&volume=1`);
                        }
                        // check if the cropping changed
                        if (stream.widthPercent !== oldStream.widthPercent ||
                            stream.heightPercent !== oldStream.heightPercent ||
                            stream.leftPercent !== oldStream.leftPercent ||
                            stream.topPercent !== oldStream.topPercent) {
                            handleStreamPosChange(obs, stream, i, currentGameLayoutRep.value, capturePositionsRep.value);
                        }
                        else {
                            // since this channel exists, make it visible
                            obs.setSourceBoundsAndCrop(getStreamSrcName(i), { visible: true });
                        }
                        handleSoundChange(obs, soundOnTwitchStreamRep.value, i, stream, oldStream);
                        //TODO: use this when switching to streamlink method, obs.setMediasourcePlayPause(getStreamSrcName(i), stream.paused)
                    }
                }
            });
            capturePositionsRep.on('change', (newVal, old) => {
                if (!old)
                    return;
                for (let i = 0; i < 4; i++) {
                    const stream = twitchStreams.value[i];
                    if (stream === undefined)
                        continue;
                    handleStreamPosChange(obs, stream, i, currentGameLayoutRep.value, newVal);
                }
            });
            currentGameLayoutRep.on('change', (newVal, old) => {
                if (!old)
                    return;
                for (let i = 0; i < 4; i++) {
                    const stream = twitchStreams.value[i];
                    if (stream === undefined)
                        continue;
                    handleStreamPosChange(obs, stream, i, newVal, capturePositionsRep.value);
                }
            });
            soundOnTwitchStreamRep.on('change', (newVal, old) => {
                if (old === undefined)
                    return;
                for (let i = 0; i < 4; i++) {
                    const stream = twitchStreams.value[i];
                    if (stream === undefined)
                        continue;
                    handleSoundChange(obs, newVal, i, stream, stream);
                }
            });
            nodecg.listenFor('streams:refreshStream', (index, callback) => {
                obs.refreshBrowserSource(getStreamSrcName(index));
                if (callback && !callback.handled) {
                    callback();
                }
            });
        }).catch((err) => {
            logger.warn('OBS connection error.');
            logger.warn('OBS connection error:', err);
        });
    }
    connect();
    obs.on('ConnectionClosed', () => {
        logger.warn('OBS connection lost, retrying in 5 seconds.');
        obsConnectionRep.value.status = 'error';
        setTimeout(connect, 5000);
    });
    // @ts-ignore: Pretty sure this emits an error.
    obs.on('error', (err) => {
        logger.warn('OBS connection error.');
        logger.debug('OBS connection error:', err);
        obsConnectionRep.value.status = 'error';
    });
    /* Don't actually care if something changes on OBS, since everything should be handled over this
    obs.on("SourceVolumeChanged", data => {
      const sourceName = data.sourceName;
      if (Object.getOwnPropertyNames(obsAudioSourcesRep.value).includes(sourceName)) {
        if
        obsAudioSourcesRep.value[sourceName].volume = data.volume;
      }
      if (sourceName == bundleConfig.obs.discordAudio) {
        obsDiscordSoundRep.value.volume = data.volume;
      } else if (sourceName == bundleConfig.obs.mpdAudio) {
        obsMpdSoundRep.value.volume = data.volume;
      } else if (sourceName == bundleConfig.obs.streamsAudio) {
        obsStreamsSoundRep.value.volume = data.volume;
      }
    });
  
    obs.on("SourceMuteStateChanged", data => {
      const sourceName = data.sourceName;
      if (sourceName == bundleConfig.obs.discordAudio) {
        obsDiscordSoundRep.value.muted = data.muted;
      } else if (sourceName == bundleConfig.obs.mpdAudio) {
        obsMpdSoundRep.value.muted = data.muted;
      } else if (sourceName == bundleConfig.obs.streamsAudio) {
        obsStreamsSoundRep.value.muted = data.muted;
      }
    }) */
    obs.on('CurrentPreviewSceneChanged', (data) => {
        obsPreviewSceneRep.value = data.sceneName;
    });
    obs.on('CurrentProgramSceneChanged', (data) => {
        obsCurrentSceneRep.value = data.sceneName;
    });
    obs.on('SceneItemTransformChanged', (scene) => {
        logger.warn(`the scene has changed to`, scene);
    });
    obs.on('SceneListChanged', () => {
        obs.call('GetSceneList').then((sceneList) => {
            const scenes = sceneList.scenes.map(x => ({ sceneIndex: x.sceneIndex, sceneName: x.sceneName }));
            obsSceneListRep.value = scenes;
        }).catch((err) => {
            logger.warn(`Cannot get current scene list: ${err.error}`);
        });
    });
    obsAudioSourcesRep.on('change', (newVal, old) => {
        if (old === undefined || newVal === null || newVal === old) {
            return;
        }
        Object.entries(newVal).forEach(([source, sound]) => {
            const oldSound = old[source];
            if (!oldSound || oldSound.volume !== sound.volume) {
                obs.setAudioVolume(source, sound.volume).catch((e) => {
                    logger.warn(`Error setting Volume for [${source}] to ${sound.volume}: ${e.error}`);
                });
            }
            if (!oldSound || oldSound.muted !== sound.muted) {
                obs.call('SetInputMute', { inputName: source, inputMuted: sound.muted }).catch((e) => {
                    logger.warn(`Error setting mute for [${source}] to ${sound.muted}: ${e.error}`);
                });
            }
            if (!oldSound || oldSound.delay !== sound.delay) {
                obs.call('SetInputAudioSyncOffset', { inputName: source, inputAudioSyncOffset: sound.delay * 1000000 }).catch((e) => {
                    logger.warn(`Error setting audio delay for [${source}] to ${sound.delay}ms: ${e.error}`);
                });
            }
        });
    });
    obsPreviewSceneRep.on('change', (newVal, old) => {
        if (old === undefined || newVal === null || newVal === old) {
            return;
        }
        obs.call('SetCurrentPreviewScene', { sceneName: newVal }).catch((e) => {
            logger.warn(`Error setting preview scene to ${newVal}: ${e.error}`);
        });
    });
    obs.on('InputVolumeMeters', ({ inputs }) => {
        obsAudioLevels.value = inputs;
        console.log(inputs);
    });
    nodecg.listenFor('obs:transition', (_data, callback) => {
        logger.info('transitioning...');
        nodecg.sendMessage('obs:startingTransition', { scene: obsPreviewSceneRep.value });
        obs.call('SetCurrentProgramScene', { sceneName: obsPreviewSceneRep.value }).then(() => {
            if (callback && !callback.handled) {
                logger.info('transitioned!');
                callback();
            }
        }).catch((e) => {
            logger.warn('error during transition:', e);
            if (callback && !callback.handled) {
                callback(e);
            }
        });
    });
}
else {
    logger.warn('OBS is disabled');
    obsConnectionRep.value.status = 'disabled';
}
exports.default = obs;
