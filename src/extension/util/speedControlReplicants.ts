/* eslint-disable max-len */

import type {
    RunDataActiveRun,
    RunDataArray,
    Timer,
    TwitchAPIData,
    TwitchCommercialTimer,
} from '../../../speedcontrol-types';
import type NodeCGTypes from '@nodecg/types';
import { get as nodecg } from './nodecg-api-context';

/**
 * This is where you can declare all your replicant to import easily into other files,
 * and to make sure they have any correct settings on startup.
 */

export const runDataActiveRunRep = nodecg().Replicant<RunDataActiveRun>('runDataActiveRun') as unknown as NodeCGTypes.ServerReplicant<RunDataActiveRun>;
export const runDataArray = nodecg().Replicant<RunDataArray>('runDataArray') as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<RunDataArray>;
export const timer = nodecg().Replicant<Timer>('timer', { persistenceInterval: 100 }) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<Timer>;
export const twitchAPIDataRep = nodecg().Replicant<TwitchAPIData>('twitchAPIData') as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<TwitchAPIData>;
export const twitchCommercialTimer = nodecg().Replicant<TwitchCommercialTimer>(
    'twitchCommercialTimer',
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<TwitchCommercialTimer>;
