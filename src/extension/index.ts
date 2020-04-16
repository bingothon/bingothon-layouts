import { NodeCG } from 'nodecg/types/server'; // eslint-disable-line
import * as nodecgApiContext from './util/nodecg-api-context';
import { VoiceActivity, SongData, ShowPictureDuringIntermission } from '../../schemas';

/* eslint-disable global-require */

export = (nodecg: NodeCG): void => {
  nodecgApiContext.set(nodecg);
  nodecg.log.info('Extension code working!');
  const { bundleConfig } = nodecg;
  //require('./bingosync');
  //require('./bingoColors');
  //require('./oriBingoBoard');
  //require('./explorationBingo');
  require('./tiltify');
  if (nodecg.bundleConfig.discord) {
    if (!nodecg.bundleConfig.discord.test) {
      require('./discord');
    } else {
      const voiceActivity = nodecg.Replicant<VoiceActivity>('voiceActivity', {
        defaultValue: {
          members: [],
        },
        persistent: true,
      });
      const defaultAvatar = 'https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png';
      voiceActivity.value = {
        members: [
          {
            id: '0', name: 'abc', avatar: defaultAvatar, isSpeaking: false,
          },
          {
            id: '1', name: 'testlongname', avatar: defaultAvatar, isSpeaking: true,
          },
          {
            id: '2', name: 'anotherone', avatar: defaultAvatar, isSpeaking: true,
          },
          {
            id: '3', name: 'POGGERS', avatar: defaultAvatar, isSpeaking: false,
          },
        ],
      };
    }
  }
  require('./twitch-chat-bot');
  //require('./gdq-donationtracker');
  require('./streams');
  require('./util/obs');
  require('./obsremotecontrol');
  if (bundleConfig.mpd && bundleConfig.mpd.enable) {
    require('./music');
  } else {
    nodecg.log.warn('MPD integration is disabled, no music!');
    nodecg.Replicant<SongData>('songData', { persistent: false, defaultValue: { playing: false, title: 'No Track Playing' } });
  }
  // this doesn't really belong anywhere
  // just make sure to declare
  nodecg.Replicant<ShowPictureDuringIntermission>('showPictureDuringIntermission');
};
