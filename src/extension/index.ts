/* eslint-disable global-require */

// This must go first so we can use module aliases!
/* eslint-disable import/first */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const alias = require('module-alias');

alias.addAlias(
    '@',
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('path').join(__dirname, '.')
);

import type NodeCG from '@nodecg/types'; // eslint-disable-line
import * as nodecgApiContext from './util/nodecg-api-context';
import { SongData, VoiceActivity } from '@/schemas';
import { Configschema } from '@/configschema';

export = (nodecg: NodeCG.ServerAPI<Configschema>): void => {
    nodecgApiContext.set(nodecg);
    nodecg.log.info('Extension code working!');
    require('./bingosync');
    require('./playBingo');
    require('./bingoColors');
    require('./externalBingoboards');
    require('./explorationBingo');
    if (nodecg.bundleConfig.discord) {
        if (!nodecg.bundleConfig.discord.test) {
            require('./discord');
        } else {
            const voiceActivity = nodecg.Replicant<VoiceActivity>('voiceActivity', {
                defaultValue: {
                    members: []
                },
                persistent: true
            });
            const defaultAvatar = 'https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png';
            voiceActivity.value = {
                members: [
                    {
                        id: '0',
                        name: 'abc',
                        avatar: defaultAvatar,
                        isSpeaking: false
                    },
                    {
                        id: '1',
                        name: 'testlongname',
                        avatar: defaultAvatar,
                        isSpeaking: true
                    },
                    {
                        id: '2',
                        name: 'anotherone',
                        avatar: defaultAvatar,
                        isSpeaking: true
                    },
                    {
                        id: '3',
                        name: 'POGGERS',
                        avatar: defaultAvatar,
                        isSpeaking: false
                    },
                    {
                        id: '4',
                        name: 'asdfasdf',
                        avatar: defaultAvatar,
                        isSpeaking: false
                    },
                    {
                        id: '5',
                        name: 'someone',
                        avatar: defaultAvatar,
                        isSpeaking: false
                    },
                    {
                        id: '6',
                        name: 'idk this is a lot',
                        avatar: defaultAvatar,
                        isSpeaking: true
                    },
                    {
                        id: '7',
                        name: 'not creative',
                        avatar: defaultAvatar,
                        isSpeaking: true
                    },
                    {
                        id: '8',
                        name: 'nr8',
                        avatar: defaultAvatar,
                        isSpeaking: false
                    },
                    {
                        id: '9',
                        name: 'nr8',
                        avatar: defaultAvatar,
                        isSpeaking: false
                    },
                    {
                        id: '10',
                        name: 'nr8',
                        avatar: defaultAvatar,
                        isSpeaking: false
                    },
                    {
                        id: '11',
                        name: 'nr8',
                        avatar: defaultAvatar,
                        isSpeaking: false
                    },
                    {
                        id: '12',
                        name: 'nr8',
                        avatar: defaultAvatar,
                        isSpeaking: false
                    },
                    {
                        id: '13',
                        name: 'nr8',
                        avatar: defaultAvatar,
                        isSpeaking: false
                    },
                    {
                        id: '14',
                        name: 'nr8',
                        avatar: defaultAvatar,
                        isSpeaking: false
                    }
                ]
            };
        }
    }
    require('./twitch-chat-bot');
    require('./gdq-donationtracker');
    require('./streams');
    require('./util/obs');
    require('./obsremotecontrol');
    require('./layoutlogic');
    if (nodecg.bundleConfig.mpd && nodecg.bundleConfig.mpd.enable) {
        require('./music');
    } else {
        nodecg.log.warn('MPD integration is disabled, no music!');
        const songDataRep = nodecg.Replicant<SongData>('songData', {
            persistent: false,
            defaultValue: { playing: true, title: 'No Track Playing' }
        });
        songDataRep.value.playing = true;
        setInterval(() => {
            songDataRep.value.title = `Cool Song 123 - Cool Band ${(Math.random() * 10).toFixed(0)}`;
        }, 10_000);
    }
};
