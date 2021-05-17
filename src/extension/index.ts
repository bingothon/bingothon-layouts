import {NodeCG} from 'nodecg/types/server'; // eslint-disable-line
import * as nodecgApiContext from './util/nodecg-api-context';
import {VoiceActivity, SongData, ShowPictureDuringIntermission} from '../../schemas';
import obs from "./util/obs";
import {TwitchCommercialTimer} from "../../speedcontrol-types";
/* eslint-disable global-require */

export = (nodecg: NodeCG): void => {
    nodecgApiContext.set(nodecg);
    nodecg.log.info('Extension code working!');
    const {bundleConfig} = nodecg;
    require('./bingosync');
    require('./bingoColors');
    require('./oriBingoBoard');
    require('./explorationBingo');
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
                    {
                        id: '4', name: 'asdfasdf', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '5', name: 'someone', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '6', name: 'idk this is a lot', avatar: defaultAvatar, isSpeaking: true,
                    },
                    {
                        id: '7', name: 'not creative', avatar: defaultAvatar, isSpeaking: true,
                    },
                    {
                        id: '8', name: 'nr8', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '9', name: 'nr8', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '10', name: 'nr8', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '11', name: 'nr8', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '12', name: 'nr8', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '13', name: 'nr8', avatar: defaultAvatar, isSpeaking: false,
                    },
                    {
                        id: '14', name: 'nr8', avatar: defaultAvatar, isSpeaking: false,
                    },
                ],
            };
        }
    }
    require('./twitch-chat-bot');
    require('./gdq-donationtracker');
    require('./streams');
    require('./util/obs');
    require('./obsremotecontrol');
    if (bundleConfig.mpd && bundleConfig.mpd.enable) {
        require('./music');
    } else {
        nodecg.log.warn('MPD integration is disabled, no music!');
        nodecg.Replicant<SongData>('songData', {
            persistent: false,
            defaultValue: {playing: false, title: 'No Track Playing'}
        });
    }
    // this doesn't really belong anywhere
    // just make sure to declare
    nodecg.Replicant<ShowPictureDuringIntermission>('showPictureDuringIntermission');
    //const text = fs.readFileSync('src/graphics/host-dashboard/fhfacts.txt', 'utf-8');

};
