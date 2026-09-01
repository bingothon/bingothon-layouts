/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Configschema } from '@/configschema';
import { CapturePositions, CurrentGameLayout, ObsAudioLevels, ObsSceneList, SoundOnTwitchStream, TwitchStream } from '@/schemas';
import OBSWebSocket, { EventSubscription } from 'obs-websocket-js';
import * as nodecgApiContext from './nodecg-api-context';
import {
    capturePositionsRep,
    currentGameLayoutRep,
    obsAudioLevels,
    obsAudioSourcesRep,
    obsConnectionPresetsRep,
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
const useHlsPlayer = bundleConfig.twitchStreams?.type === 'hls';

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
    const layoutName = currentGameLayout.name;
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
    public async doConnectAndInit(settings: { url: string; password: string }) {
        obsConnectionRep.value.status = 'connecting';
        try {
            await obs.connect(settings.url, settings.password, {
                eventSubscriptions: EventSubscription.All | EventSubscription.InputVolumeMeters,
                rpcVersion: 1
            });
        } catch (e) {
            obsConnectionRep.value.status = 'error';
            throw e;
        }
        logger.info('OBS connection successful.');
        obsConnectionRep.value.status = 'connected';
        try {
            // we need studio mode
            await obs.call('SetStudioModeEnabled', { studioModeEnabled: true });

            const previewScene = await obs.call('GetCurrentPreviewScene');
            obsPreviewScene.value = previewScene.currentPreviewSceneName;

            const programScene = await obs.call('GetCurrentProgramScene');
            obsCurrentSceneRep.value = programScene.currentProgramSceneName;

            // TODO: remove when they fix their types
            const sceneList = (await obs.call('GetSceneList')).scenes as unknown as ObsSceneList;
            obsSceneListRep.value = sceneList.map((scene) => ({ sceneIndex: scene.sceneIndex, sceneName: scene.sceneName }));

            // obs default browser sources
            for (let i = 0; i < 6; i++) {
                await obs.setDefaultBrowserSettings(getStreamSrcName(i));
            }
            logger.info('OBS init successful.');
        } catch (e) {
            logger.error('could not do initial setup', e);
        }
    }
    /**
     * Change to this OBS scene.
     * @param name Name of the scene.
     */
    public async changeProgramScene(name: string): Promise<void> {
        if (this.isDisabled()) return;
        await this.call('SetCurrentProgramScene', { sceneName: name }).catch((e) => logger.error(`could not set program scene to ${name}`, e));
    }

    public async changePrviewScene(name: string | undefined): Promise<void> {
        if (this.isDisabled()) return;
        await this.call('SetCurrentPreviewScene', { sceneName: name }).catch((e) => logger.error(`could not set preview scene to ${name}`, e));
    }

    /**
     * Set volume for a source
     * @param source Source which volume is changed
     * @param volume Volume from 0.0 to 1.0 (inclusive)
     */
    public async setAudioVolume(source: string, volume: number): Promise<void> {
        if (this.isDisabled()) return;
        await this.call('SetInputVolume', { inputName: source, inputVolumeMul: volume }).catch((e) =>
            logger.error(`could not set volume of ${source} to ${volume}`, e)
        );
    }

    /**
     * Set volume for a source
     * @param source Source which volume is muted/unmuted
     * @param mute boolean
     */
    public async setAudioMute(source: string, mute: boolean): Promise<void> {
        if (this.isDisabled()) return;
        await this.call('SetInputMute', { inputName: source, inputMuted: mute }).catch((e) =>
            logger.error(`could not set mute status of ${source} to ${mute}`, e)
        );
    }

    public async setAudioSyncOffset(source: string, offsetMs: number): Promise<void> {
        obs.call('SetInputAudioSyncOffset', {
            inputName: source,
            inputAudioSyncOffset: offsetMs
        }).catch((e): void => {
            logger.error(`Error setting audio delay for [${source}] to ${offsetMs}ms`, e);
        });
    }

    /**
     * Update the played input from a media source
     * @param source name of the media source
     * @param url link to the stream that ffmpeg can handle, get from streamlink
     */
    public async setMediasourceUrl(source: string, url: string): Promise<void> {
        if (this.isDisabled()) return;
        await this.call('SetInputSettings', {
            inputName: source,
            //sourceType: "ffmpeg_source", // just to make sure
            inputSettings: {
                input: url,
                is_local_file: false
            }
        }).catch((e) => logger.error(`could not set media url of ${source} to ${url}`, e));
    }

    /**
     * Update the played input from a media source
     * @param source name of the media source
     * @param localFile path to the local file to play
     */
    public async setMediasourceLocalFile(source: string, localFile: string): Promise<void> {
        if (this.isDisabled()) return;
        await this.call('SetInputSettings', {
            inputName: source,
            inputSettings: {
                input: localFile,
                is_local_file: true
            },
            // TODO: is this a good idea? This resets the settings to default and then applies the new config
            overlay: false
        }).catch((e) => logger.error(`could not set media file of ${source} to ${localFile}`, e));
    }

    /**
     * Play or pause a media source
     * @param source name of the media source
     * @param pause whether the source should be paused now, false starts the source
     */

    public async setMediasourcePlayPause(source: string, pause: boolean): Promise<void> {
        if (this.isDisabled()) return;
        await this.call('TriggerMediaInputAction', {
            inputName: source,
            mediaAction: pause ? 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY' : 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PAUSE' // TODO: deprecated, but no alternative?
        }).catch((e) => logger.error(`could not ${pause ? 'pause' : 'play'} mediasource ${source}`, e));
    }

    public async refreshMediasource(source: string): Promise<void> {
        if (this.isDisabled()) return;
        logger.info(`triggered refresh for source ${source}`);
        await this.call('TriggerMediaInputAction', {
            inputName: source,
            mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART' // TODO: deprecated, but no alternative?
        }).catch((e) => logger.error(`could not refresh mediasource ${source}`, e));
    }

    public async setSourceBoundsAndCrop(source: string, params: OBSTransformParams): Promise<void> {
        if (this.isDisabled()) return;
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
        if (this.isDisabled()) return;
        await this.call('SetInputSettings', {
            inputName: source,
            inputSettings: {
                height: 1080,
                width: 1920,
                fps: 30, // TODO: maybe 60?
                reroute_audio: true
            }
        }).catch((e) => logger.error(`could not set browser defaults on ${source}`, e));
    }

    public async setBrowserSourceUrl(source: string, url: string): Promise<void> {
        if (this.isDisabled()) return;
        // browser settings: "fps":28,"height":1080,"url":"https://obsproject.com/browser-source2","width":1920
        await this.call('SetInputSettings', {
            inputName: source,
            inputSettings: {
                url
            }
        }).catch((e) => logger.error(`could not set browser source url of ${source} to ${url}`, e));
    }

    public async refreshBrowserSource(source: string): Promise<void> {
        if (this.isDisabled()) return;
        logger.info(`triggered refresh for source ${source}`);
        await this.call('PressInputPropertiesButton', {
            inputName: source,
            propertyName: 'refreshnocache'
        }).catch((e: unknown) => logger.error(`could not refresh browser source ${source}`, e));
    }

    public async takeSourceScreenshot(source: string): Promise<string> {
        if (this.isDisabled()) return '';
        const response = await this.call('GetSourceScreenshot', {
            imageFormat: 'jpeg',
            sourceName: source,
            imageHeight: 300
        });

        return response.imageData;
    }

    public isConnected(): boolean {
        return obsConnectionRep.value.status === 'connected';
    }

    public isDisabled(): boolean {
        return obsConnectionRep.value.status === 'disabled';
    }
}

const obs = new OBSUtility();

if (bundleConfig.obs && bundleConfig.obs.enable) {
    // temporary hack to make these values accessible to the new layouts
    obsConnectionPresetsRep.value = Object.keys(bundleConfig.obs.presets ?? {});
    // recover after a restart
    obsConnectionRep.once('change', async (newVal) => {
        logger.info('old connection:', newVal.url);
        if (newVal.url && newVal.password) {
            obs.doConnectAndInit({
                url: newVal.url,
                password: newVal.password
            }).catch((e) => logger.error(`could not recover connection to obs at ${newVal.url}`, e));
        }
    });

    nodecg.listenFor('obs:connect', async (data, cb) => {
        let err = null;
        if (typeof data.url === 'string' && typeof data.password === 'string') {
            try {
                obsConnectionRep.value.url = data.url;
                obsConnectionRep.value.password = data.password;
                obsConnectionRep.value.preset = undefined;
                await obs.doConnectAndInit({
                    url: data.url,
                    password: data.password
                });
            } catch (e) {
                logger.error(`could not connect to obs at ${data.url}`, e);
                err = e;
            }
        } else {
            err = new Error('url and password are required!');
        }
        if (cb && !cb.handled) {
            cb(err);
        }
    });

    nodecg.listenFor('obs:connectPreset', async (data, cb) => {
        let err = null;
        if (typeof data.preset === 'string') {
            const settings = bundleConfig.obs.presets?.[data.preset];
            if (!settings) {
                err = new Error(`preset ${data.preset} doesn't exist`);
            } else {
                try {
                    obsConnectionRep.value.url = settings.url;
                    obsConnectionRep.value.password = settings.password;
                    obsConnectionRep.value.preset = data.preset;
                    await obs.doConnectAndInit({
                        url: settings.url,
                        password: settings.password
                    });
                } catch (e) {
                    logger.error(`could not connect to obs at ${data.url}`, e);
                    err = e;
                }
            }
        } else {
            err = new Error('preset is required!');
        }
        if (cb && !cb.handled) {
            cb(err);
        }
    });

    nodecg.listenFor('obs:disconnect', async (_data, cb) => {
        let err = null;
        obsConnectionRep.value = {
            status: 'disconnected'
        };
        try {
            await obs.disconnect();
        } catch (e) {
            logger.warn('error disconnecting from obs', e);
            err = e;
        }
        if (cb && !cb.handled) {
            cb(err);
        }
    });

    obsConnectionRep.value.status = 'disconnected';

    // default if they somehow not exist
    [bundleConfig.obs.discordAudio, bundleConfig.obs.mpdAudio].forEach((audioSource): void => {
        if (!Object.getOwnPropertyNames(obsAudioSourcesRep.value).includes(audioSource)) {
            obsAudioSourcesRep.value[audioSource] = {
                volume: 0.5,
                muted: false,
                delay: 0,
                volumeMultiplier: 1
            };
        }
    });

    if (useObsTwitchPlayer || useHlsPlayer) {
        // TODO check if the comment is still needed
        // TODO repair in the future
        streamsReplicant.on('change', (newValue, old) => {
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
                        if (useObsTwitchPlayer) {
                            // fire and forget
                            obs.setBrowserSourceUrl(
                                getStreamSrcName(idx),
                                `https://player.twitch.tv/?channel=${stream.channel}&enableExtensions=true&muted=false&parent=twitch.tv&player=popout&volume=1`
                            );
                        } else {
                            const streamGraphicUrl = bundleConfig.twitchStreams?.playerGraphic;
                            if (streamGraphicUrl) {
                                const url = new URL(streamGraphicUrl);
                                url.searchParams.set('stream', `${i}`);
                                obs.setBrowserSourceUrl(getStreamSrcName(idx), url.toString());
                            }
                            // TODO: either we never overwrite this, the source should stay the same, or I need to figure out where to get the key from
                            // const browserSource = `${nodecgApiContext.get().config.baseURL}bundles/bingothon-layouts-vue-3/graphics/hls-player/main.html?stream=${idx}`
                        }
                    }
                    handleStreamPosChange(obs, stream, idx, currentGameLayoutRep.value, capturePositionsRep.value);
                    handleSoundChange(obs, soundOnTwitchStream.value, idx, stream, oldStream);
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

        capturePositionsRep.on('change', (newVal, old) => {
            if (!old) return;
            let actualPosIndex = 0;
            streamsReplicant.value.forEach((stream) => {
                if (stream.visible) {
                    handleStreamPosChange(obs, stream, actualPosIndex, currentGameLayoutRep.value, newVal);
                    actualPosIndex++;
                    return;
                }
                return;
            });
        });

        currentGameLayoutRep.on('change', (newVal, old) => {
            if (!old) return;
            let actualPosIndex = 0;
            streamsReplicant.value.forEach((stream) => {
                if (stream.visible) {
                    handleStreamPosChange(obs, stream, actualPosIndex, newVal, capturePositionsRep.value);
                    actualPosIndex++;
                    return;
                }
                return;
            });
        });

        soundOnTwitchStream.on('change', (newVal, old) => {
            if (old === undefined) return;

            streamsReplicant.value.forEach((stream, i) => {
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

    obs.on('ConnectionClosed', (): void => {
        if (obsConnectionRep.value.status != 'disconnected') {
            logger.warn('OBS connection lost, retrying in 5 seconds.');
            obsConnectionRep.value.status = 'error';
            setTimeout(() => {
                if (obsConnectionRep.value.status === 'error') {
                    const url = obsConnectionRep.value.url;
                    const password = obsConnectionRep.value.password;
                    if (url && password) {
                        obs.doConnectAndInit({ url, password }).catch((e) => logger.error(`could not recover connection to obs at ${url}`, e));
                    }
                }
            }, 5000);
        }
    });

    obs.on('ConnectionError', (err): void => {
        logger.warn('OBS connection error:', err);
        obsConnectionRep.value.status = 'error';
    });

    obs.on('InputVolumeMeters', (data): void => {
        interface InputVolumeMeterChangedItem {
            inputName: string;
            inputLevelsMul: number[][];
        }

        // TODO: their typings are broken
        const newObsAudioLevels: ObsAudioLevels = {};
        const inputVolumes = data.inputs as unknown as InputVolumeMeterChangedItem[];
        for (const input of inputVolumes) {
            const inputLevel = input.inputLevelsMul?.[0]?.[1];
            if (inputLevel && inputLevel > 0) {
                const dBlevel = 100 + (20 / 2.302585092994) * Math.log(inputLevel);
                newObsAudioLevels[input.inputName] = { volume: dBlevel };
            } else {
                newObsAudioLevels[input.inputName] = { volume: 0 };
            }
        }
        obsAudioLevels.value = newObsAudioLevels;

        // Limiter for the intermission music
        const mpdAudio = inputVolumes.filter((input) => input.inputName === bundleConfig.obs.mpdAudio)[0];
        if (mpdAudio) {
            if (mpdAudio.inputLevelsMul.length > 0) {
                if (mpdAudio.inputLevelsMul[0][0] > 0.25) {
                    obs.setAudioVolume(bundleConfig.obs.mpdAudio, mpdAudio.inputLevelsMul[0][1] - 0.01);
                }
            }
        }
    });

    obs.on('CurrentPreviewSceneChanged', (data): void => {
        obsPreviewScene.value = data.sceneName;
    });

    obs.on('CurrentProgramSceneChanged', (data): void => {
        obsCurrentSceneRep.value = data.sceneName;
    });

    obs.on('SceneItemTransformChanged', (scene) => {
        logger.warn(`the scene has changed to`, scene);
    });

    obs.on('SceneListChanged', (): void => {
        obs.call('GetSceneList')
            .then((sceneList): void => {
                obsSceneListRep.value = sceneList.scenes.map((x) => ({
                    sceneIndex: x.sceneIndex as number,
                    sceneName: x.sceneName as string
                }));
            })
            .catch((err): void => {
                logger.warn(`Cannot get current scene list: ${err.error}`);
            });
    });

    obsAudioSourcesRep.on('change', (newVal, old): void => {
        if (old === undefined || newVal === null || newVal === old) {
            return;
        }
        Object.entries(newVal).forEach(([source, sound]): void => {
            const oldSound = old[source];
            if (!oldSound || oldSound.volume !== sound.volume) {
                obs.setAudioVolume(source, sound.volume);
            }
            if (!oldSound || oldSound.muted !== sound.muted) {
                obs.setAudioMute(source, sound.muted);
            }
            if (!oldSound || oldSound.delay !== sound.delay) {
                function reallySettingDelay(delay: number) {
                    obs.setAudioSyncOffset(source, delay);
                }
                // OBS is stupid
                // otherwise setting the delay to something like 7 seconds doesn't work
                reallySettingDelay(sound.delay);
                setTimeout(() => reallySettingDelay(sound.delay + 1), 300);
                setTimeout(() => reallySettingDelay(sound.delay), 600);
            }
        });
    });

    obsPreviewScene.on('change', (newVal, old): void => {
        if (old === undefined || newVal === null || newVal === old) {
            return;
        }
        obs.changePrviewScene(newVal);
    });

    nodecg.listenFor('obs:transition', (_data, callback): void => {
        logger.info('transitioning...');
        logger.info(`Data: ${JSON.stringify(_data)}`);
        let nextScene = obsPreviewScene.value;
        if (_data && _data.sceneName) {
            nextScene = _data.sceneName;
        }
        nodecg.sendMessage('obs:startingTransition', { scene: nextScene });
        obs.changeProgramScene(nextScene || '').then((): void => {
            // setting ! on obsPreviewScene.value!
            if (callback && !callback.handled) {
                logger.info('transitioned!');
                callback();
            }
        });
    });
} else {
    logger.warn('OBS is disabled');
    obsConnectionRep.value.status = 'disabled';
}

export default obs;
