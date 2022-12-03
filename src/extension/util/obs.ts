import OBSWebSocket, { EventSubscription, EventTypes, OBSResponseTypes } from 'obs-websocket-js';
import * as nodecgApiContext from './nodecg-api-context';
import { Configschema } from '../../../configschema';
import { CapturePositions, CurrentGameLayout, ObsAudioSources, ObsConnection, SoundOnTwitchStream, TwitchStreams, ObsAudioLevels } from '../../../schemas';
import { TwitchStream } from 'types';

// this module is used to communicate directly with OBS
// and transparently handle:
//  - audio volume/mute/delay
//  - preview and current scene
//  - transitions

const nodecg = nodecgApiContext.get();
const logger = new nodecg.Logger(`${nodecg.bundleName}:obs`);
const bundleConfig = nodecg.bundleConfig as Configschema;

interface OBSTransformParams {
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  cropTop?: number,
  cropBottom?: number,
  cropLeft?: number,
  cropRight?: number,
  visible?: boolean,
};




function getStreamSrcName(idx: number): string {
  return `twitch-stream-${idx}`;
}

function handleStreamPosChange(obs: OBSUtility, stream: TwitchStream, streamIdx: number, currentGameLayout: CurrentGameLayout, capturePositions: CapturePositions) {
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
  obs.setSourceBoundsAndCrop(getStreamSrcName(streamIdx),
    {
      cropLeft, cropTop, cropRight, cropBottom, visible: true,
      x: capturePos.x,
      y: capturePos.y,
      width: capturePos.width,
      height: capturePos.height,
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
    await this.call("SetInputSettings", {
      inputName: source,
      //sourceType: "ffmpeg_source", // just to make sure
      inputSettings: {
        input: url,
        is_local_file: false,
      }
    }).catch(e => logger.error('could not set source settings', e));
  }

  /**
   * Play or pause a media source
   * @param source name of the media source
   * @param pause whether the source should be paused now, false starts the source
   */

  public async setMediasourcePlayPause(source: string, pause: boolean): Promise<void> {
    // TODO: remove this garbage once obs-websocket-js updates to proper bindings
    // const mediaStatus = await obs.call('GetMediaInputStatus', { inputName: source })
    // logger.warn(mediaStatus)
    if (pause) {
      //logger.warn(`setting ${source} to paused`)
      await (this as any).call("TriggerMediaInputAction", {
        inputName: source,
        mediaAction: 'OBS_MEDIA_PAUSE_PLAY', // TODO: Might not be a correct media action..
      }).catch((e: any) => logger.error('could not set play pause', e));
    }
  }


  public async refreshMediasource(source: string): Promise<void> {
    // TODO: remove this garbage once obs-websocket-js updates to proper bindings
    console.log(`triggered refresh for source ${source}`)
    await (this as any).send("RestartMedia", {
      sourceName: source,
    }).catch((e: any) => logger.error('could not restart media', e));
  }

  public async setSourceBoundsAndCrop(source: string, params: OBSTransformParams): Promise<void> {
    logger.info(`updating source ${source}: ` + JSON.stringify(params));
    const sceneItem = await this.call("GetSceneItemId", {
      sceneName: bundleConfig.obs.gameScene || 'game',
      sourceName: source
    }).catch(e => logger.error('could not get GetSceneItemId', e))
    //const sceneTransform = await obs.call('GetSceneItemTransform', { sceneName: bundleConfig.obs.gameScene || 'game', sceneItemId: sceneItem!.sceneItemId })
    //logger.warn(sceneTransform) 
    if (params.visible) {
      await this.call("SetSceneItemEnabled", { sceneName: bundleConfig.obs.gameScene || 'game', sceneItemId: sceneItem!.sceneItemId, sceneItemEnabled: true })
    } else {
      await this.call("SetSceneItemEnabled", { sceneName: bundleConfig.obs.gameScene || 'game', sceneItemId: sceneItem!.sceneItemId, sceneItemEnabled: false })
    }
    await this.call("SetSceneItemTransform", {
      sceneName: bundleConfig.obs.gameScene || 'game',
      sceneItemId: sceneItem!.sceneItemId, // TO DO GET THE CORRECT SCENEITEMID see why sceneItem is not there

      sceneItemTransform: {
        boundsHeight: params.height,
        boundsType: 'OBS_BOUNDS_STRETCH',
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
  }

  public async setDefaultBrowserSettings(source: string): Promise<void> {
    await this.call("SetInputSettings", {
      inputName: source,
      inputSettings: {
        height: 1080,
        width: 1920,
        fps: 30, // TODO: maybe 60?
        reroute_audio: true,
      }
    }).catch(e => logger.error('could not set browser defaults', e))
  }

  public async setBrowserSourceUrl(source: string, url: string): Promise<void> {
    // browser settings: "fps":28,"height":1080,"url":"https://obsproject.com/browser-source2","width":1920
    await this.call("SetInputSettings", {
      inputName: source,
      inputSettings: {
        url,
      }
    }).catch(e => logger.error('could not set browser source settings', e));
  }

  public async refreshBrowserSource(source: string): Promise<void> {
    logger.info(`triggered refresh for source ${source}`)
    await this.call("PressInputPropertiesButton", {
      inputName: source,
      propertyName: "refreshnocache"
    }).catch((e: any) => logger.error('could not refresh browser source', e));
  }
  public async takeSourceScreenshot(source: string): Promise<string> {
    const response = await this.call("GetSourceScreenshot", {
      imageFormat: "jpeg",
      sourceName: source,
      imageHeight: 300,
    }).catch(e => logger.error(`Could not make source screenshot from source: ${source}`, e));

    return response!.imageData;
  }

  public async setAudioLevels(audioSource: string, data: EventTypes['InputVolumeMeters'], repository: any): Promise<void> {
    const matchAudioSource = data.inputs.filter((matchAudioSource): boolean => matchAudioSource.inputName === audioSource)[0];
    if (matchAudioSource) {
      //@ts-ignore
      if (matchAudioSource.inputLevelsMul.length > 0) {
        //@ts-ignore
        const dBlevel = 100 + 20. / 2.302585092994 * Math.log(matchAudioSource.inputLevelsMul[0][1])
        //@ts-ignore
        if (matchAudioSource.inputLevelsMul[0][1] > 0) {
          //logger.warn(`dBlevel: ${dBlevel}`)
          repository.value[audioSource] = {
            // .inputLevelsMul[0][0] is the average of the left and right channels
            // .inputLevelsMul[0][1] is the peak of the left and right channels
            // .inputLevelsMul[0][2] is the peak of input audio
            volume: dBlevel,
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
    } else {
      repository.value[audioSource] = {
        volume: 0
      };
    }

  }
}

const obsConnectionRep = nodecg.Replicant<ObsConnection>('obsConnection');

const obs = new OBSUtility();

if (bundleConfig.obs && bundleConfig.obs.enable) {
  // local values to make sure there is no update loop

  const obsAudioSourcesRep = nodecg.Replicant<ObsAudioSources>('obsAudioSources');
  const obsPreviewSceneRep = nodecg.Replicant<string | null>('obsPreviewScene', { defaultValue: null });
  const obsCurrentSceneRep = nodecg.Replicant<string | null>('obsCurrentScene', { defaultValue: null });
  const obsSceneListRep = nodecg.Replicant<any | null>('obsSceneList', { defaultValue: null }); // TODO: create a type Scene and replace 'any' with 'Scene[]'
  const capturePositionsRep = nodecg.Replicant<CapturePositions>('capturePositions');
  const currentGameLayoutRep = nodecg.Replicant<CurrentGameLayout>('currentGameLayout');
  const soundOnTwitchStreamRep = nodecg.Replicant<SoundOnTwitchStream>('soundOnTwitchStream');
  const twitchStreams = nodecg.Replicant<TwitchStreams>('twitchStreams');
  const obsAudioLevels = nodecg.Replicant<ObsAudioLevels>('obsAudioLevels', { defaultValue: {}, persistent: false });
  // load the intermission audio source

  const settings = {
    url: bundleConfig.obs.address,
    password: bundleConfig.obs.password,
  };
  logger.info('Setting up OBS connection.');
  obsConnectionRep.value.status = 'disconnected';

  // eslint-disable-next-line no-inner-declarations
  function connect(): void {
    obs.connect(settings.url, settings.password, {
      eventSubscriptions: EventSubscription.All | EventSubscription.InputVolumeMeters,
      rpcVersion: 1
    }).then((): void => {
      logger.info('OBS connection successful.');
      obsConnectionRep.value.status = 'connected';

      // we need studio mode
      obs.call('GetStudioModeEnabled').then((resp) => {
        if (!resp.studioModeEnabled) {
          obs.call('SetStudioModeEnabled', {studioModeEnabled: true}).catch((e): void => {
            logger.error("Can't set studio mode", e);
          });
        }
      });

      // default if they somehow not exist
      [bundleConfig.obs.discordAudio, bundleConfig.obs.mpdAudio, bundleConfig.obs.streamsAudio]
        .forEach((audioSource): void => {
          if (!Object.getOwnPropertyNames(obsAudioSourcesRep.value).includes(audioSource)) {
            obsAudioSourcesRep.value[audioSource] = { volume: 0.5, muted: false, delay: 0, volumeMultiplier: 1 };
          }
        });

      obs.call('GetCurrentPreviewScene').then((scene): void => {
        obsPreviewSceneRep.value = scene.currentPreviewSceneName;
      }).catch((err): void => {
        logger.warn(`Cannot get preview scene: ${err.error}`);
      });

      obs.call('GetCurrentProgramScene').then((scene): void => {
        obsCurrentSceneRep.value = scene.currentProgramSceneName;
      }).catch((err): void => {
        logger.warn(`Cannot get current scene: ${err.error}`);
      });

      obs.call('GetSceneList').then((sceneList): void => {
        obsSceneListRep.value = sceneList.scenes;
      }).catch((err): void => {
        logger.warn(`Cannot get current scene list: ${err.error}`);
      });

      // obs default browser sources
      for (let i = 0; i < 6; i++) {
        obs.setDefaultBrowserSettings(getStreamSrcName(i));
      }

      twitchStreams.on('change', (newValue, old) => {
        if (!old) return;
        for (let i = 0; i < 6; i++) {
          const stream = newValue[i];
          const oldStream = old[i] || {}; // old stream might be undefined
          if (stream === undefined) {
            // this stream should not be displayed
            let transProps: OBSTransformParams = {
              visible: false,
            };
            // fire and forget
            obs.setSourceBoundsAndCrop(getStreamSrcName(i), transProps);
          } else {
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
            } else {
              // since this channel exists, make it visible
              obs.setSourceBoundsAndCrop(getStreamSrcName(i), { visible: true });
            }
            handleSoundChange(obs, soundOnTwitchStreamRep.value, i, stream, oldStream);
            //TODO: use this when switching to streamlink method, obs.setMediasourcePlayPause(getStreamSrcName(i), stream.paused)
          }
        }
      });

      capturePositionsRep.on('change', (newVal, old) => {
        if (!old) return;

        twitchStreams.value.forEach((stream, i) => {
          handleStreamPosChange(obs, stream, i, currentGameLayoutRep.value, newVal);
        });
      });

      currentGameLayoutRep.on('change', (newVal, old) => {
        if (!old) return;

        twitchStreams.value.forEach((stream, i) => {
          handleStreamPosChange(obs, stream, i, newVal, capturePositionsRep.value);
        });
      });

      soundOnTwitchStreamRep.on('change', (newVal, old) => {
        if (old === undefined) return;

        twitchStreams.value.forEach((stream, i) => {
          handleSoundChange(obs, newVal, i, stream, stream);
        });
      });

      nodecg.listenFor('streams:refreshStream', (index, callback) => {
        obs.refreshBrowserSource(getStreamSrcName(index));
        if (callback && !callback.handled) {
          callback();
        }
      });


    }).catch((err): void => {
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
      inputName: string,
      inputLevelsMul: number[][],
    }

    // TODO: their typings are broken
    const newObsAudioLevels: ObsAudioLevels = {};
    for (const input of (data.inputs as unknown as  InputVolumeMeterChangedItem[])) {
      const inputLevel = input.inputLevelsMul?.[0]?.[1];
      if (inputLevel && inputLevel > 0) {
        const dBlevel = 100 + 20. / 2.302585092994 * Math.log(inputLevel);
        newObsAudioLevels[input.inputName] = {volume: dBlevel};
      } else {
        newObsAudioLevels[input.inputName] = {volume: 0};
      }
    }
    obsAudioLevels.value = newObsAudioLevels;

    // Limiter for the intermission music
    const mpdAudio = data.inputs.filter((input) => input.inputName === bundleConfig.obs.mpdAudio)[0];
    if (mpdAudio) {
      //@ts-ignore
      if (mpdAudio.inputLevelsMul.length > 0) {
        //@ts-ignore
        if (mpdAudio.inputLevelsMul[0][0] > 0.25) {
          //@ts-ignore
          obs.call('SetInputVolume', { inputName: bundleConfig.obs.mpdAudio, inputVolumeMul: mpdAudio.inputLevelsMul[0][1] - 0.01 });
        }
      }
    }
  });

  obs.on('CurrentPreviewSceneChanged', (data): void => {
    obsPreviewSceneRep.value = data.sceneName;
  });

  obs.on('CurrentProgramSceneChanged', (data): void => {
    obsCurrentSceneRep.value = data.sceneName;
  });

  obs.on('SceneItemTransformChanged', (scene) => {
    logger.warn(`the scene has changed to`, scene)
  })

  obs.on('SceneListChanged', (): void => {
    obs.call('GetSceneList').then((sceneList): void => {
      const scenes = sceneList.scenes.map(x => ({ sceneIndex: x.sceneIndex as number, sceneName: x.sceneName as string }))
      obsSceneListRep.value = scenes;
    }).catch((err): void => {
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
        obs.setAudioVolume(source, sound.volume).catch((e): void => {
          logger.warn(`Error setting Volume for [${source}] to ${sound.volume}: ${e.error}`);
        });
      }
      if (!oldSound || oldSound.muted !== sound.muted) {
        obs.call('SetInputMute', { inputName: source, inputMuted: sound.muted }).catch((e): void => {
          logger.warn(`Error setting mute for [${source}] to ${sound.muted}: ${e.error}`);
        });
      }
      if (!oldSound || oldSound.delay !== sound.delay) {
        obs.call('SetInputAudioSyncOffset', { inputName: source, inputAudioSyncOffset: sound.delay * 1000000 }).catch((e): void => {
          logger.warn(`Error setting audio delay for [${source}] to ${sound.delay}ms: ${e.error}`);
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
    nodecg.sendMessage('obs:startingTransition', { scene: obsPreviewSceneRep.value });
    obs.call('SetCurrentProgramScene', { sceneName: obsPreviewSceneRep.value! }).then((): void => { // setting ! on obsPreviewSceneRep.value! 
      if (callback && !callback.handled) {
        logger.info('transitioned!');
        callback();
      }
    }).catch((e): void => {
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
