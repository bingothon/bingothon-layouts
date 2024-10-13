import type NodeCGTypes from '@nodecg/types';
import {
    LayoutMeta,
    ScorePlayers,
    VoiceActivity
} from 'schemas';
import { get as nodecg } from './nodecg-api-context';

/**
 * This is where you can declare all your replicant to import easily into other files,
 * and to make sure they have any correct settings on startup.
 */

export const soundOnTwitchStream = nodecg().Replicant<number>('soundOnTwitchStream', {
    defaultValue: -1
});
export const voiceActivityRep = nodecg().Replicant<VoiceActivity>('voiceActivity', {
    defaultValue: { members: [] },
    persistent: true
});
export const scorePlayers = nodecg().Replicant<ScorePlayers>("scorePlayers", {defaultValue: []});

export const layoutMeta = nodecg().Replicant<LayoutMeta>("layoutMeta");
