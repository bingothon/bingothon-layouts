import * as nodecgApiContext from './util/nodecg-api-context';
import { TwitchStreams } from '../../schemas';
import { RunDataActiveRun } from '../../speedcontrol-types';
import { TwitchStream } from '../../types';

const nodecg = nodecgApiContext.get();

// Twitch aspect ratio 1024x576

const runDataActiveRunReplicant = nodecg.Replicant <RunDataActiveRun>('runDataActiveRun', 'nodecg-speedcontrol');

const streamsReplicant = nodecg.Replicant <TwitchStreams>('twitchStreams', { defaultValue: [] });
const soundOnTwitchStream = nodecg.Replicant<number>('soundOnTwitchStream', { defaultValue: -1 });

const aspectRatioToCropping: {[key: string]: {widthPercent: number, heightPercent: number, topPercent: number, leftPercent: number}} = {
  '16:9': {
    widthPercent: 100, heightPercent: 100, topPercent: 0, leftPercent: 0,
  },
  '16:9 co-op' : {
    widthPercent: 100, heightPercent: 100, topPercent: 0, leftPercent: 0,
  },
  '15:9': {
    widthPercent: 106.667, heightPercent: 100, topPercent: 0, leftPercent: 0,
  },
  '4:3': {
    widthPercent: 133.333, heightPercent: 100, topPercent: 0, leftPercent: 0,
  },
  '4:3 co-op': {
    widthPercent: 133.333, heightPercent: 100, topPercent: 0, leftPercent: 0,
  },
  '3:2': {
    widthPercent: 118.5255, heightPercent: 100, topPercent: 0, leftPercent: 0,
  },
  '10:9': {
    widthPercent: 160, heightPercent: 100, topPercent: 0, leftPercent: 0,
  },
  '10:9 co-op': {
    widthPercent: 160, heightPercent: 100, topPercent: 0, leftPercent: 0,
  },
  'DS': {
    widthPercent: 240, heightPercent: 100, topPercent: 0, leftPercent: 0,
  },
  '16:10': {
    widthPercent: 111.111, heightPercent: 100, topPercent: 0, leftPercent: 0,
  },
};

streamsReplicant.once('change', (): void => {
  runDataActiveRunReplicant.on('change', (newVal, old): void => {
    // don't reset on server restart
    if (!newVal || !old) return;

    // set the initial cropping based on the aspect ratio marked in the schedule
    let cropping = {
      widthPercent: 100, heightPercent: 100, topPercent: 0, leftPercent: 0,
    };
    if (newVal.customData && newVal.customData.Layout) {
      cropping = aspectRatioToCropping[newVal.customData.Layout] || cropping;
    }

    // grab all runners
    const newStreams: TwitchStreams = [];
    let idx = 0;
    newVal.teams.forEach((team, teamIndex): void => {
      team.players.forEach((player, playerIndex): void => {
        // nodecg.log.info(`${player.social.twitch} to ${old.teams[teamIndex]?.players[playerIndex]?.social.twitch}`)
        // in case the replicant changed, but this stream wasn't affected, don't reset cropping
        // fill everything with defaults
        let current: TwitchStream = {
          channel: 'esamarathon',
          quality: 'chunked',
          widthPercent: 100,
          heightPercent: 100,
          topPercent: 0,
          leftPercent: 0,
          volume: 1,
          paused: false,
          delay: -1,
          availableQualities: [],
        };
        current.widthPercent = cropping.widthPercent;
        current.heightPercent = cropping.heightPercent;
        current.topPercent = cropping.topPercent;
        current.leftPercent = cropping.leftPercent;
        if (!player.social || !player.social.twitch) {
          nodecg.log.error(`Twitch name for player ${player.name} missing!`);
          current.paused = true;
        } else {
          const oldStream = streamsReplicant.value[idx];
          // check against old replicant, in case of a stream override
          if (!oldStream || player.social.twitch !== old.teams[teamIndex]?.players[playerIndex]?.social.twitch) {
            current.channel = player.social.twitch;
          } else {
            current = oldStream;
          }
        }
        newStreams.push(current);
        idx += 1;
      });
    });
    // make sure soundOnTwitchStream isn't OoB in streamsReplicant
    if (soundOnTwitchStream.value >= newStreams.length) {
      soundOnTwitchStream.value = -1; // mute all
    }
    streamsReplicant.value = newStreams;
  });
});

nodecg.listenFor('streams:setSoundOnTwitchStream', (streamNr: number, callback): void => {
  soundOnTwitchStream.value = streamNr;
  if (callback && !callback.handled) {
    callback();
  }
});

nodecg.listenFor('streams:toggleStreamPlayPause', (streamNr: number, callback): void => {
  if (streamNr >= 0 && streamNr < streamsReplicant.value.length) {
    streamsReplicant.value[streamNr].paused = !streamsReplicant.value[streamNr].paused;
  }
  if (callback && !callback.handled) {
    callback();
  }
});

nodecg.listenFor('streams:setStreamVolume', (data: {id: number; volume: number}, callback): void => {
  if (data.volume > 1 || data.volume < 0) {
    if (callback && !callback.handled) {
      callback('volume has to be between 0 and 1!');
    }
    return;
  }
  if (data.id >= 0 && data.id < streamsReplicant.value.length) {
    streamsReplicant.value[data.id].volume = data.volume;
  }
  if (callback && !callback.handled) {
    callback();
  }
});

nodecg.listenFor('streams:setStreamQuality', (data: {id: number; quality: string}, callback): void => {
  if (data.id >= 0 && data.id < streamsReplicant.value.length) {
    streamsReplicant.value[data.id].quality = data.quality;
  }
  if (callback && !callback.handled) {
    callback();
  }
});
