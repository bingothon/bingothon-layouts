/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Configschema } from '@/configschema';
import { CapturePositions, CurrentGameLayout, ObsAudioLevels, ObsSceneList, SoundOnTwitchStream, TwitchStream } from '@/schemas';
import OBSWebSocket, { EventSubscription, EventTypes } from 'obs-websocket-js';
import * as nodecgApiContext from './nodecg-api-context';
import {
    capturePositionsRep,
    currentGameLayoutRep,
    obsAudioLevels,
    obsAudioSourcesRep,
    obsConnectionRep,
    obsCurrentSceneRep,
    obsPreviewScene,
    obsSceneListRep,
    soundOnTwitchStream,
    streamsReplicant
} from './replicants';

// this module is used to communicate directly with OBS
// and transparently handle:
//  - audio volume/mute/delay
//  - preview and current scene
//  - transitions

const nodecg = nodecgApiContext.get();
const logger = new nodecg.Logger(`${nodecg.bundleName}:obs`);
const bundleConfig = nodecg.bundleConfig as Configschema;

const useObsTwitchPlayer = bundleConfig.twitchStreams?.type === 'obsTwitchPlayer';

interface OBSTransformParams {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    cropTop?: number;
    cropBottom?: number;
    cropLeft?: number;
    cropRight?: number;
    visible?: boolean;
}

function getStreamSrcName(idx: number): string {
    return `twitch-stream-${idx}`;
}

function handleStreamPosChange(
    obs: OBSUtility,
    stream: TwitchStream,
    streamIdx: number,
    currentGameLayout: CurrentGameLayout,
    capturePositions: CapturePositions
) {
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
    const cropLeft = Math.max(0, (1920 * -stream.leftPercent) / 100);
    const cropTop = Math.max(0, (1080 * -stream.topPercent) / 100);
    const cropRight = Math.max(0, 1920 * (1 - 100 / stream.widthPercent) - cropLeft);
    const cropBottom = Math.max(0, 1080 * (1 - 100 / stream.heightPercent) - cropTop);
    // fire and forget
    obs.setSourceBoundsAndCrop(getStreamSrcName(streamIdx), {
        cropLeft,
        cropTop,
        cropRight,
        cropBottom,
        visible: true,
        x: capturePos.x,
        y: capturePos.y,
        width: capturePos.width,
        height: capturePos.height
    });
}

function handleSoundChange(obs: OBSUtility, soundOnTwitchStream: SoundOnTwitchStream, streamIdx: number, newStream: TwitchStream, oldStream: TwitchStream) {
    obs.setAudioMute(getStreamSrcName(streamIdx), soundOnTwitchStream !== streamIdx);

    if (newStream.volume !== oldStream.volume) {
        obs.setAudioVolume(getStreamSrcName(streamIdx), newStream.volume);
    }
}

// Extending the OBS library with some of our own functions.
class OBSUtility extends OBSWebSocket {
    /**
     * Change to this OBS scene.
     * @param name Name of the scene.
     */
    public async changeScene(name: string): Promise<void> {
        await this.call('SetCurrentProgramScene', { sceneName: name });
    }

    /**
     * Get the Volume for a source
     * @param source Name of the source which volume should be changed
     */
    public async getAudioVolume(source: string): Promise<number> {
        const resp = await this.call('GetInputVolume', { inputName: source });
        return resp.inputVolumeMul;
    }

    /**
     * Set volume for a source
     * @param source Source which volume is changed
     * @param volume Volume from 0.0 to 1.0 (inclusive)
     */
    public async setAudioVolume(source: string, volume: number): Promise<void> {
        await this.call('SetInputVolume', { inputName: source, inputVolumeMul: volume });
    }

    /**
     * Set volume for a source
     * @param source Source which volume is muted/unmuted
     * @param mute boolean
     */
    public async setAudioMute(source: string, mute: boolean): Promise<void> {
        await this.call('SetInputMute', { inputName: source, inputMuted: mute });
    }

    /**
     * Update the played input from a media source
     * @param source name of the media source
     * @param url link to the stream that ffmpeg can handle, get from streamlink
     */
    public async setMediasourceUrl(source: string, url: string): Promise<void> {
        await this.call('SetInputSettings', {
            inputName: source,
            //sourceType: "ffmpeg_source", // just to make sure
            inputSettings: {
                input: url,
                is_local_file: false
            }
        }).catch((e) => logger.error('could not set source settings', e));
    }

    /**
     * Play or pause a media source
     * @param source name of the media source
     * @param pause whether the source should be paused now, false starts the source
     */

    public async setMediasourcePlayPause(source: string, pause: boolean): Promise<void> {
        try {
            await this.call('TriggerMediaInputAction', {
                inputName: source,
                mediaAction: pause ? 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY' : 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PAUSE' // TODO: deprecated, but no alternative?
            });
        } catch (e) {
            logger.error('could not set play pause', e);
        }
    }

    public async refreshMediasource(source: string): Promise<void> {
        // TODO: remove this garbage once obs-websocket-js updates to proper bindings
        console.log(`triggered refresh for source ${source}`);
        try {
            await this.call('TriggerMediaInputAction', {
                inputName: source,
                mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART' // TODO: deprecated, but no alternative?
            });
        } catch (e) {
            logger.error('could not set play pause', e);
        }
    }

    public async setSourceBoundsAndCrop(source: string, params: OBSTransformParams): Promise<void> {
        logger.info(`updating source ${source}: ` + JSON.stringify(params));
        try {
            const sceneItem = await this.call('GetSceneItemId', {
                sceneName: bundleConfig.obs.gameScene || 'game',
                sourceName: source
            });
            await this.call('SetSceneItemEnabled', {
                sceneName: bundleConfig.obs.gameScene || 'game',
                sceneItemId: sceneItem.sceneItemId,
                sceneItemEnabled: !!params.visible
            });
            await this.call('SetSceneItemTransform', {
                sceneName: bundleConfig.obs.gameScene || 'game',
                sceneItemId: sceneItem.sceneItemId,

                sceneItemTransform: {
                    boundsHeight: params.height || 1080,
                    boundsType: 'OBS_BOUNDS_STRETCH',
                    boundsWidth: params.width || 1920,
                    cropBottom: params.cropBottom || 0,
                    cropLeft: params.cropLeft || 0,
                    cropRight: params.cropRight || 0,
                    cropTop: params.cropTop || 0,
                    positionX: params.x || 0,
                    positionY: params.y || 0,
                    scaleX: 1,
                    scaleY: 1
                }
            });
        } catch (e) {
            logger.error(`error in setSourceBoundsAndCrop for source ${source}:`, e);
        }
    }

    public async setDefaultBrowserSettings(source: string): Promise<void> {
        await this.call('SetInputSettings', {
            inputName: source,
            inputSettings: {
                height: 1080,
                width: 1920,
                fps: 30, // TODO: maybe 60?
                reroute_audio: true
            }
        }).catch((e) => logger.error('could not set browser defaults', e));
    }

    public async setBrowserSourceUrl(source: string, url: string): Promise<void> {
        // browser settings: "fps":28,"height":1080,"url":"https://obsproject.com/browser-source2","width":1920
        await this.call('SetInputSettings', {
            inputName: source,
            inputSettings: {
                url
            }
        }).catch((e) => logger.error('could not set browser source settings', e));
    }

    public async refreshBrowserSource(source: string): Promise<void> {
        logger.info(`triggered refresh for source ${source}`);
        await this.call('PressInputPropertiesButton', {
            inputName: source,
            propertyName: 'refreshnocache'
        }).catch((e: unknown) => logger.error('could not refresh browser source', e));
    }

    public async takeSourceScreenshot(source: string): Promise<string> {
        const response = await this.call('GetSourceScreenshot', {
            imageFormat: 'jpeg',
            sourceName: source,
            imageHeight: 300
        });

        return response.imageData;
    }

    public async setAudioLevels(
        audioSource: string,
        data: EventTypes['InputVolumeMeters'],
        repository: { value: { [k: string]: { volume: number } } }
    ): Promise<void> {
        const matchAudioSource = data.inputs.filter((matchAudioSource): boolean => matchAudioSource.inputName === audioSource)[0];
        if (matchAudioSource) {
            //@ts-ignore
            if (matchAudioSource.inputLevelsMul.length > 0) {
                //@ts-ignore
                const dBlevel = 100 + (20 / 2.302585092994) * Math.log(matchAudioSource.inputLevelsMul[0][1]);
                //@ts-ignore
                if (matchAudioSource.inputLevelsMul[0][1] > 0) {
                    //logger.warn(`dBlevel: ${dBlevel}`)
                    repository.value[audioSource] = {
                        // .inputLevelsMul[0][0] is the average of the left and right channels
                        // .inputLevelsMul[0][1] is the peak of the left and right channels
                        // .inputLevelsMul[0][2] is the peak of input audio
                        volume: dBlevel
                    };
                } else {
                    repository.value[audioSource] = {
                        volume: 0
                    };
                }
            } else {
                repository.value[audioSource] = {
                    volume: 0
                };
            }
        } else {
            repository.value[audioSource] = {
                volume: 0
            };
        }
    }
}

const obs = new OBSUtility();

if (bundleConfig.obs && bundleConfig.obs.enable) {
    // local values to make sure there is no update loop

    const audioSourcesRep = obsAudioSourcesRep;
    const obsPreviewSceneRep = obsPreviewScene;
    const currentSceneRep = obsCurrentSceneRep;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sceneListRep = obsSceneListRep;
    const positionsRep = capturePositionsRep;
    const currentLayoutRep = currentGameLayoutRep;
    const soundOnTwitchStreamRep = soundOnTwitchStream;
    const twitchStreamsRep = streamsReplicant;
    const audioLevelsRep = obsAudioLevels;
    // load the intermission audio source

    const settings = {
        url: bundleConfig.obs.address,
        password: bundleConfig.obs.password
    };
    logger.info('Setting up OBS connection.');
    obsConnectionRep.value.status = 'disconnected';

    // eslint-disable-next-line no-inner-declarations
    function connect(): void {
        obs.connect(settings.url, settings.password, {
            eventSubscriptions: EventSubscription.All | EventSubscription.InputVolumeMeters,
            rpcVersion: 1
        })
            .then((): void => {
                logger.info('OBS connection successful.');
                obsConnectionRep.value.status = 'connected';

                // we need studio mode
                obs.call('GetStudioModeEnabled').then((resp) => {
                    if (!resp.studioModeEnabled) {
                        obs.call('SetStudioModeEnabled', { studioModeEnabled: true }).catch((e): void => {
                            logger.error("Can't set studio mode", e);
                        });
                    }
                });

                // default if they somehow not exist
                [bundleConfig.obs.discordAudio, bundleConfig.obs.mpdAudio, bundleConfig.obs.streamsAudio].forEach((audioSource): void => {
                    if (!Object.getOwnPropertyNames(audioSourcesRep.value).includes(audioSource)) {
                        audioSourcesRep.value[audioSource] = {
                            volume: 0.5,
                            muted: false,
                            delay: 0,
                            volumeMultiplier: 1
                        };
                    }
                });

                obs.call('GetCurrentPreviewScene')
                    .then((scene): void => {
                        obsPreviewSceneRep.value = scene.currentPreviewSceneName;
                    })
                    .catch((err): void => {
                        logger.warn(`Cannot get preview scene: ${err}`);
                    });

                obs.call('GetCurrentProgramScene')
                    .then((scene): void => {
                        currentSceneRep.value = scene.currentProgramSceneName;
                    })
                    .catch((err): void => {
                        logger.warn(`Cannot get current scene: ${err}`);
                    });

                obs.call('GetSceneList')
                    .then((sceneList): void => {
                        sceneListRep.value = (sceneList.scenes as unknown as ObsSceneList).map((scene) => {
                            return { sceneIndex: scene.sceneIndex, sceneName: scene.sceneName };
                        });
                    })
                    .catch((err): void => {
                        logger.warn(`Cannot get current scene list: ${err.error}`);
                    });

                // obs default browser sources
                for (let i = 0; i < 6; i++) {
                    obs.setDefaultBrowserSettings(getStreamSrcName(i));
                }

                if (useObsTwitchPlayer || true) {
                    // TODO check if the comment is still needed
                    // TODO repair in the future
                    twitchStreamsRep.on('change', (newValue, old) => {
                        if (!old) return;
                        const streamsToHide = new Set([0, 1, 2, 3, 4, 5]);
                        let idx = 0; //stream index
                        let i = 0; //array index
                        while (idx < 6 && i < newValue.length) {
                            // appearently this can go out of bonds
                            if (!newValue[i] || !newValue[i].visible) {
                                i++;
                                continue;
                            }
                            const stream = newValue[i];
                            const oldStream = old[i] || {}; // old stream might be undefined
                            if (stream === undefined) {
                                // this stream should not be displayed
                                const transProps: OBSTransformParams = {
                                    visible: false
                                };
                                // fire and forget
                                obs.setSourceBoundsAndCrop(getStreamSrcName(idx), transProps);
                            } else {
                                streamsToHide.delete(idx);
                                // check if the streamurl changed or the visible status changed
                                if (stream.channel !== oldStream.channel || stream.visible !== oldStream.visible) {
                                    // fire and forget
                                    obs.setBrowserSourceUrl(
                                        getStreamSrcName(idx),
                                        `https://player.twitch.tv/?channel=${stream.channel}&enableExtensions=true&muted=false&parent=twitch.tv&player=popout&volume=1`
                                    );
                                }
                                handleStreamPosChange(obs, stream, idx, currentLayoutRep.value, positionsRep.value);
                                handleSoundChange(obs, soundOnTwitchStreamRep.value, idx, stream, oldStream);
                                //TODO: use this when switching to streamlink method, obs.setMediasourcePlayPause(getStreamSrcName(i), stream.paused)
                            }
                            idx++;
                            i++;
                        }
                        for (const stream of streamsToHide) {
                            // this stream should not be displayed
                            const transProps: OBSTransformParams = {
                                visible: false
                            };
                            // fire and forget
                            obs.setSourceBoundsAndCrop(getStreamSrcName(stream), transProps);
                        }
                    });

                    positionsRep.on('change', (newVal, old) => {
                        if (!old) return;
                        let actualPosIndex = 0;
                        twitchStreamsRep.value.forEach((stream) => {
                            if (stream.visible) {
                                handleStreamPosChange(obs, stream, actualPosIndex, currentLayoutRep.value, newVal);
                                actualPosIndex++;
                                return;
                            }
                            return;
                        });
                    });

                    currentLayoutRep.on('change', (newVal, old) => {
                        if (!old) return;
                        let actualPosIndex = 0;
                        twitchStreamsRep.value.forEach((stream) => {
                            if (stream.visible) {
                                handleStreamPosChange(obs, stream, actualPosIndex, newVal, positionsRep.value);
                                actualPosIndex++;
                                return;
                            }
                            return;
                        });
                    });

                    soundOnTwitchStreamRep.on('change', (newVal, old) => {
                        if (old === undefined) return;

                        twitchStreamsRep.value.forEach((stream, i) => {
                            handleSoundChange(obs, newVal, i, stream, stream);
                        });
                    });

                    nodecg.listenFor('streams:refreshStream', (index, callback) => {
                        obs.refreshBrowserSource(getStreamSrcName(index));
                        if (callback && !callback.handled) {
                            callback();
                        }
                    });
                }
            })
            .catch((err): void => {
                logger.warn('OBS connection error.');
                logger.warn('OBS connection error:', err);
            });
    }

    connect();
    obs.on('ConnectionClosed', (): void => {
        logger.warn('OBS connection lost, retrying in 5 seconds.');
        obsConnectionRep.value.status = 'error';
        setTimeout(connect, 5000);
    });

    // @ts-ignore: Pretty sure this emits an error.
    obs.on('error', (err): void => {
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

    obs.on('InputVolumeMeters', (data): void => {
        interface InputVolumeMeterChangedItem {
            inputName: string;
            inputLevelsMul: number[][];
        }

        // TODO: their typings are broken
        const newObsAudioLevels: ObsAudioLevels = {};
        for (const input of data.inputs as unknown as InputVolumeMeterChangedItem[]) {
            const inputLevel = input.inputLevelsMul?.[0]?.[1];
            if (inputLevel && inputLevel > 0) {
                const dBlevel = 100 + (20 / 2.302585092994) * Math.log(inputLevel);
                newObsAudioLevels[input.inputName] = { volume: dBlevel };
            } else {
                newObsAudioLevels[input.inputName] = { volume: 0 };
            }
        }
        audioLevelsRep.value = newObsAudioLevels;

        // Limiter for the intermission music
        const mpdAudio = data.inputs.filter((input) => input.inputName === bundleConfig.obs.mpdAudio)[0];
        if (mpdAudio) {
            //@ts-ignore
            if (mpdAudio.inputLevelsMul.length > 0) {
                //@ts-ignore
                if (mpdAudio.inputLevelsMul[0][0] > 0.25) {
                    obs.call('SetInputVolume', {
                        inputName: bundleConfig.obs.mpdAudio,
                        //@ts-ignore
                        inputVolumeMul: mpdAudio.inputLevelsMul[0][1] - 0.01
                    });
                }
            }
        }
    });

    obs.on('CurrentPreviewSceneChanged', (data): void => {
        obsPreviewSceneRep.value = data.sceneName;
    });

    obs.on('CurrentProgramSceneChanged', (data): void => {
        currentSceneRep.value = data.sceneName;
    });

    obs.on('SceneItemTransformChanged', (scene) => {
        logger.warn(`the scene has changed to`, scene);
    });

    obs.on('SceneListChanged', (): void => {
        obs.call('GetSceneList')
            .then((sceneList): void => {
                sceneListRep.value = sceneList.scenes.map((x) => ({
                    sceneIndex: x.sceneIndex as number,
                    sceneName: x.sceneName as string
                }));
            })
            .catch((err): void => {
                logger.warn(`Cannot get current scene list: ${err.error}`);
            });
    });

    audioSourcesRep.on('change', (newVal, old): void => {
        if (old === undefined || newVal === null || newVal === old) {
            return;
        }
        Object.entries(newVal).forEach(([source, sound]): void => {
            const oldSound = old[source];
            if (!oldSound || oldSound.volume !== sound.volume) {
                obs.setAudioVolume(source, sound.volume).catch((e): void => {
                    logger.warn(`Error setting Volume for [${source}] to ${sound.volume}: ${e}`);
                });
            }
            if (!oldSound || oldSound.muted !== sound.muted) {
                obs.call('SetInputMute', { inputName: source, inputMuted: sound.muted }).catch((e): void => {
                    logger.warn(`Error setting mute for [${source}] to ${sound.muted}: ${e}`);
                });
            }
            if (!oldSound || oldSound.delay !== sound.delay) {
                obs.call('SetInputAudioSyncOffset', {
                    inputName: source,
                    inputAudioSyncOffset: sound.delay * 1000000
                }).catch((e): void => {
                    logger.warn(`Error setting audio delay for [${source}] to ${sound.delay}ms: ${e}`);
                });
            }
        });
    });

    obsPreviewSceneRep.on('change', (newVal, old): void => {
        if (old === undefined || newVal === null || newVal === old) {
            return;
        }
        obs.call('SetCurrentPreviewScene', { sceneName: newVal }).catch((e): void => {
            logger.warn(`Error setting preview scene to ${newVal}: ${e.error}`);
        });
    });

    nodecg.listenFor('obs:transition', (_data, callback): void => {
        logger.info('transitioning...');
        logger.info(`Data: ${JSON.stringify(_data)}`);
        let nextScene = obsPreviewSceneRep.value;
        if (_data && _data.sceneName) {
            nextScene = _data.sceneName;
        }
        nodecg.sendMessage('obs:startingTransition', { scene: nextScene });
        obs.call('SetCurrentProgramScene', { sceneName: nextScene || '' })
            .then((): void => {
                // setting ! on obsPreviewSceneRep.value!
                if (callback && !callback.handled) {
                    logger.info('transitioned!');
                    callback();
                }
            })
            .catch((e): void => {
                logger.warn('error during transition:', e);
                if (callback && !callback.handled) {
                    callback(e);
                }
            });
    });
} else {
    logger.warn('OBS is disabled');
    obsConnectionRep.value.status = 'disabled';
}

export default obs;
