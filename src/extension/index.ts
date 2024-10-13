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
import { VoiceActivity } from '@/schemas';
import { Configschema } from '@/configschema';

export = (nodecg: NodeCG.ServerAPI<Configschema>): void => {
    nodecgApiContext.set(nodecg);
    nodecg.log.info('Extension code working!');
    require('./scorePlayers');
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
            const defaultAvatar = 'https://cdn.discordapp.com/avatars/264490864582197258/54bda67ab5b6f09deb757db4984920b3.webp';
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
};
