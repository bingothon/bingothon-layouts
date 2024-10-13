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
    require('./countdownTimer');
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
            const names = ['abc', 'testlongname', 'anotherone', 'POGGERS', 'asdfasdf', 'someone', 'idk this is a lot', 'not creative', ...new Array(8).fill('nr8')];
            voiceActivity.value = {
                members: names.map((name, index) => ({
                    id: `${index}`,
                    avatar: defaultAvatar,
                    isSpeaking: Math.random() > 0.5,
                    name: name,
                    nickname: null,
                    username: name,
                }))
            };
        }
    }
};
