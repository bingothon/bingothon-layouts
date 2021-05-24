'use-strict';

import * as nodecgApiContext from './util/nodecg-api-context';
import { Configschema } from '../../configschema';
import {
  ObsDashboardAudioSources, ObsAudioSources, ObsConnection, DiscordDelayInfo,
  TwitchStreams, ObsStreamMode, CurrentGameLayout,
  CurrentInterview, HostsSpeakingDuringIntermission, LastIntermissionTimestamp, ObsStreams, ObsStreamsInternal,
} from '../../schemas';
import { RunDataActiveRun } from '../../speedcontrol-types';
import { waitForReplicants } from './util/waitForReplicants';

// this handles dashboard utilities, all around automating the run setup process
// and setting everything in OBS properly ontransitions
// this uses the transparent bindings form the obs.ts in util

const nodecg = nodecgApiContext.get();
const logger = new nodecg.Logger(`${nodecg.bundleName}:obsstreamcontrol`);
const bundleConfig = nodecg.bundleConfig as Configschema;


const obsCurrentSceneRep = nodecg.Replicant<string | null>('obsCurrentScene');
const obsDashboardAudioSourcesRep = nodecg.Replicant<ObsDashboardAudioSources>('obsDashboardAudioSources');
const obsAudioSourcesRep = nodecg.Replicant<ObsAudioSources>('obsAudioSources');
const obsConnectionRep = nodecg.Replicant<ObsConnection>('obsConnection');
const obsStreamModeRep = nodecg.Replicant<ObsStreamMode>('obsStreamMode');
const discordDelayInfoRep = nodecg.Replicant<DiscordDelayInfo>('discordDelayInfo');

const currentGameLayoutRep = nodecg.Replicant<CurrentGameLayout>('currentGameLayout');
const currentInterviewLayoutRep = nodecg.Replicant<CurrentInterview>('currentInterview');

const runDataActiveRunRep = nodecg.Replicant<RunDataActiveRun>('runDataActiveRun', 'nodecg-speedcontrol');

const voiceDelayRep = nodecg.Replicant<number>('voiceDelay', { defaultValue: 0, persistent: true });
const obsStreams = nodecg.Replicant<ObsStreams>('obsStreams');
const soundOnTwitchStream = nodecg.Replicant<number>('soundOnTwitchStream', { defaultValue: -1 });
const hostDiscordDuringIntermissionRep = nodecg.Replicant<HostsSpeakingDuringIntermission>('hostsSpeakingDuringIntermission');
const lastIntermissionTimestampRep = nodecg.Replicant<LastIntermissionTimestamp>('lastIntermissionTimestamp');

// make sure we are connected to OBS before loading any of the functions that depend on OBS
function waitTillConnected(): Promise<void> {
  return new Promise((resolve): void => {
    function conWait(val: ObsConnection): void {
      if (val.status === 'connected') {
        obsConnectionRep.removeListener('change', conWait);
        resolve();
      }
    }
    obsConnectionRep.on('change', conWait);
  });
}