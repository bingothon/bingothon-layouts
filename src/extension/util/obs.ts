import obsWebsocketJs from 'obs-websocket-js';
import * as nodecgApiContext from './nodecg-api-context';
import { Configschema } from '../../../configschema';
import { ObsAudioSources, ObsConnection, ObsStreamsInternal } from '../../../schemas';
import { getStreamsForChannel } from './streamlink';

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

// Extending the OBS library with some of our own functions.
class OBSUtility extends obsWebsocketJs {
  /**
   * Change to this OBS scene.
   * @param name Name of the scene.
   */
  public changeScene(name: string): Promise<void> {
    return new Promise((resolve, reject): void => {
      this.send('SetCurrentScene', { 'scene-name': name }).then(resolve).catch((err): void => {
        logger.warn(`Cannot change OBS scene [${name}]: ${err.error}`);
        reject();
      });
    });
  }

  /**
   * Get the Volume for a source
   * @param source Name of the source which volume should be changed
   */
  public getAudioVolume(source: string): Promise<number> {
    return new Promise((resolve, reject): void => {
      this.send('GetVolume', { source }).then((resp): void => {
        resolve(resp.volume);
      }).catch((err): void => {
        reject(err);
      });
    });
  }

  /**
   * Set volume for a source
   * @param source Source which volume is changed
   * @param volume Volume from 0.0 to 1.0 (inclusive)
   */
  public setAudioVolume(source: string, volume: number): Promise<void> {
    return new Promise((resolve, reject): void => {
      this.send('SetVolume', { source, volume }).then(resolve).catch((err): void => {
        // logger.warn(`Cannot set volume [${source}]: ${err.error}`);
        reject(err);
      });
    });
  }

  public setAudioMute(source: string, mute: boolean): Promise<void> {
    return new Promise((resolve, reject): void => {
      this.send('SetMute', { source, mute }).then(resolve).catch((err): void => {
        reject(err);
      })
    });
  }

  /**
   * Update the played input from a media source
   * @param source name of the media source
   * @param url link to the stream that ffmpeg can handle, get from streamlink
   */
  public async setMediasourceUrl(source: string, url: string): Promise<void> {
    await this.send("SetSourceSettings", {
      sourceName: source,
      sourceType: "ffmpeg_source", // just to make sure
      sourceSettings: {
        input: url,
        is_local_file: false,
      }
    });
  }

  /**
   * Play or pause a media source
   * @param source name of the media source
   * @param pause whether the source should be paused now, false starts the source
   */
  public async setMediasourcePlayPause(source: string, pause: boolean): Promise<void> {
    // TODO: remove this garbage once obs-websocket-js updates to proper bindings
    await (this as any).send("PlayPauseMedia", {
      sourceName: source,
      playPause: pause,
    });
  }

  public async refreshMediasource(source: string): Promise<void> {
    // TODO: remove this garbage once obs-websocket-js updates to proper bindings
    await (this as any).send("RestartMedia", {
      sourceName: source,
    });
  }

  public async setSourceBoundsAndCrop(source: string, params: OBSTransformParams): Promise<void> {
      // TODO: implement, see SetSceneItemProperties
      await this.send("SetSceneItemProperties", {
        "scene-name": bundleConfig.obs.gameScene || 'game', // TODO: should probably go in config
        item: {name: source},
        position: {
          x: params.x,
          y: params.y,
        },
        bounds: {
          type: "OBS_BOUNDS_SCALE_INNER", // TODO: test
          x: params.width,
          y: params.height,
        },
        scale: {},
        visible: params.visible,
        crop: {
          bottom: params.cropBottom,
          left: params.cropLeft,
          right: params.cropRight,
          top: params.cropTop,
        },
      });
    }
}

const obsConnectionRep = nodecg.Replicant<ObsConnection>('obsConnection');

const obs = new OBSUtility();

if (bundleConfig.obs && bundleConfig.obs.enable) {
  // local values to make sure there is no update loop

  const obsAudioSourcesRep = nodecg.Replicant<ObsAudioSources>('obsAudioSources');
  const obsPreviewSceneRep = nodecg.Replicant<string | null>('obsPreviewScene', { defaultValue: null });
  const obsCurrentSceneRep = nodecg.Replicant<string | null>('obsCurrentScene', { defaultValue: null });
  const obsSceneListRep = nodecg.Replicant<obsWebsocketJs.Scene[] | null>('obsSceneList', { defaultValue: null });

  const obsStreamsInternal = nodecg.Replicant<ObsStreamsInternal>('obsStreamsInternal', {defaultValue: {layout: "asdf", streams: []}});

  const settings = {
    address: bundleConfig.obs.address,
    password: bundleConfig.obs.password,
  };
  logger.info('Setting up OBS connection.');
  obsConnectionRep.value.status = 'disconnected';

  // eslint-disable-next-line no-inner-declarations
  function connect(): void {
    obs.connect(settings).then((): void => {
      logger.info('OBS connection successful.');
      obsConnectionRep.value.status = 'connected';

      // getStreamsForChannel("esamarathon").then(async streams => {
      //   const best = streams.find(s => s.quality == '720p');
      //   if (best === undefined) {
      //     throw Error('no best quality');
      //   }
      //   const sourceName = "twitch-stream-0";
      //   await obs.setMediasourceUrl(sourceName, best.streamUrl);
      //   const params: OBSTransformParams = {
      //     x: 159,
      //     y: 204,
      //     width: 810,
      //     height: 608,
      //     cropLeft: 669,
      //     cropBottom: 149,
      //     cropRight: 0,
      //     cropTop: 0,
      //   };
      //   await obs.setSourceBoundsAndCrop(sourceName, params);
      // });

      // obs.refreshMediasource("twitch-stream-0")
      //   .then(v => console.log("refreshed stream!!!"));

      // we need studio mode
      obs.send('EnableStudioMode').catch((e): void => {
        logger.error("Can't set studio mode", e);
      });

      // default if they somehow not exist
      [bundleConfig.obs.discordAudio, bundleConfig.obs.mpdAudio, bundleConfig.obs.streamsAudio]
        .forEach((audioSource): void => {
          if (!Object.getOwnPropertyNames(obsAudioSourcesRep.value).includes(audioSource)) {
            obsAudioSourcesRep.value[audioSource] = { volume: 0.5, muted: false, delay: 0 };
          }
        });

      obs.send('GetPreviewScene').then((scene): void => {
        obsPreviewSceneRep.value = scene.name;
        logger.info('init update preview scene');
      }).catch((err): void => {
        logger.warn(`Cannot get preview scene: ${err.error}`);
      });

      obs.send('GetCurrentScene').then((scene): void => {
        obsCurrentSceneRep.value = scene.name;
        logger.info('init current scene');
      }).catch((err): void => {
        logger.warn(`Cannot get current scene: ${err.error}`);
      });

      obs.send('GetSceneList').then((sceneList): void => {
        obsSceneListRep.value = sceneList.scenes;
      }).catch((err): void => {
        logger.warn(`Cannot get current scene list: ${err.error}`);
      });

      obsStreamsInternal.on('change', async (newStreams, old) => {
        // limited to 8 streams, idk if we ever need more
        // if the layout changed, update everything
        if (newStreams.layout !== (old || {}).layout) {
          for(let i = 0;i<8;i++) {
            const stream = newStreams.streams[i];
            if (stream === undefined) {
              continue;
            }
            const sourceName = `twitch-stream-${i}`;
            await obs.setMediasourceUrl(sourceName, stream.streamUrl);
            await obs.setSourceBoundsAndCrop(sourceName, {
              x: stream.x,
              y: stream.y,
              width: stream.width,
              height: stream.height,
              cropBottom: stream.cropBottom,
              cropLeft: stream.cropLeft,
              cropRight: stream.cropRight,
              cropTop: stream.cropTop,
              visible: stream.visible,
            });
            await obs.setAudioVolume(sourceName, stream.volume);
            await obs.setAudioMute(sourceName, stream.muted);
          }
        } else {
          for(let i = 0;i < 8;i++) {
            const stream = newStreams.streams[i];
            const oldStream = (old?.streams || [])[i] || {};
            if (stream === undefined) {
              // this is fine, not all streams might be set
              continue;
            }
            const sourceName = `twitch-stream-${i}`;
            // check if url changed
            if (stream.streamUrl !== oldStream.streamUrl) {
              await obs.setMediasourceUrl(sourceName, stream.streamUrl);
            }
            // check if any other params changed
            if (stream.x !== oldStream.x || 
              stream.y !== oldStream.y || 
              stream.width !== oldStream.width || 
              stream.height !== oldStream.height || 
              stream.cropBottom !== oldStream.cropBottom || 
              stream.cropLeft !== oldStream.cropLeft || 
              stream.cropRight !== oldStream.cropRight || 
              stream.cropTop !== oldStream.cropTop || 
              stream.visible !== oldStream.visible) {
                await obs.setSourceBoundsAndCrop(sourceName, {
                  x: stream.x,
                  y: stream.y,
                  width: stream.width,
                  height: stream.height,
                  cropBottom: stream.cropBottom,
                  cropLeft: stream.cropLeft,
                  cropRight: stream.cropRight,
                  cropTop: stream.cropTop,
                  visible: stream.visible,
                });
              }
            if (stream.volume !== oldStream.volume) {
              await obs.setAudioVolume(sourceName, stream.volume);
            }
            if (stream.muted !== oldStream.muted) {
              await obs.setAudioMute(sourceName, stream.muted);
            }
          }
        }
      });
    }).catch((err): void => {
      logger.warn('OBS connection error.');
      logger.debug('OBS connection error:', err);
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

  obs.on('PreviewSceneChanged', (data): void => {
    obsPreviewSceneRep.value = data['scene-name'];
  });

  obs.on('SwitchScenes', (data): void => {
    obsCurrentSceneRep.value = data['scene-name'];
  });

  obs.on('ScenesChanged', (): void => {
    obs.send('GetSceneList').then((sceneList): void => {
      obsSceneListRep.value = sceneList.scenes;
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
        obs.send('SetMute', { source, mute: sound.muted }).catch((e): void => {
          logger.warn(`Error setting mute for [${source}] to ${sound.muted}: ${e.error}`);
        });
      }
      if (!oldSound || oldSound.delay !== sound.delay) {
        obs.send('SetSyncOffset', { source, offset: sound.delay * 1000000 }).catch((e): void => {
          logger.warn(`Error setting audio delay for [${source}] to ${sound.delay}ms: ${e.error}`);
        });
      }
    });
  });

  obsPreviewSceneRep.on('change', (newVal, old): void => {
    if (old === undefined || newVal === null || newVal === old) {
      return;
    }
    obs.send('SetPreviewScene', { 'scene-name': newVal }).catch((e): void => {
      logger.warn(`Error setting preview scene to ${newVal}: ${e.error}`);
    });
  });

  nodecg.listenFor('obs:transition', (_data, callback): void => {
    logger.info('transitioning...');
    nodecg.sendMessage('obs:startingTransition', { scene: obsPreviewSceneRep.value });
    obs.send('TransitionToProgram', {}).then((): void => {
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
