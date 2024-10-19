import clone from 'clone';
import Vue, { set } from 'vue';
import Vuex, { Store } from 'vuex';
import {
    CountdownTimer,
    LayoutMeta,
    LayoutTimer,
    ScorePlayers,
    SongData,
    SoundOnTwitchStream,
    VoiceActivity
} from '../../schemas';
import type NodeCGTypes from '@nodecg/types';

Vue.use(Vuex);

const replicantNames = [
    'countdownTimer',
    'layoutMeta',
    'layoutTimer',
    'soundOnTwitchStream',
    'voiceActivity',
    'songData',
    'scorePlayers',
];
const replicants: Map<string, NodeCGTypes.ClientReplicant<any>> = new Map();

let playerAlternateInterval: NodeJS.Timeout | null = null;

interface StoreTypes {
    // bingothon
    countdownTimer: CountdownTimer,
    layoutMeta: LayoutMeta,
    layoutTimer: LayoutTimer,
    soundOnTwitchStream: SoundOnTwitchStream;
    voiceActivity: VoiceActivity;
    songData: SongData;
    scorePlayers: ScorePlayers;
    // timer
    playerAlternate: true;
}

export const store = new Store<StoreTypes>({
    state: {
        // bingothon
        countdownTimer: {} as CountdownTimer,
        layoutMeta: {} as LayoutMeta,
        layoutTimer: {} as LayoutTimer,
        soundOnTwitchStream: 0 as SoundOnTwitchStream,
        voiceActivity: {} as VoiceActivity,
        songData: {} as SongData,
        scorePlayers: [] as ScorePlayers,
        // timer
        playerAlternate: true,
    },
    mutations: {
        updateReplicant(state, { name, value }) {
            set(state, name, value);
        },
        startPlayerAlternateInterval(state, interval) {
            if (playerAlternateInterval) {
                clearInterval(playerAlternateInterval);
            }
            playerAlternateInterval = setInterval(() => {
                set(state, 'playerAlternate', !state.playerAlternate);
            }, interval) as unknown as NodeJS.Timeout;
        },
        stopPlayerAlternateInterval() {
            if (playerAlternateInterval) {
                clearInterval(playerAlternateInterval);
            }
            playerAlternateInterval = null;
        },
    },
});

store.commit('startPlayerAlternateInterval', 10000);

/**
 * Gets the raw replicant, only intended for modifications, to use values use state
 * @param replicant name of the replicant, throws an error if it isn't found
 */
export function getReplicant<T>(replicant: string): NodeCGTypes.ClientReplicant<T> {
    const rep = replicants.get(replicant);
    if (!rep) {
        throw new Error('invalid replicant!');
    }
    return rep;
}

replicantNames.forEach((name) => {
    const replicant = nodecg.Replicant(name);

    replicant.on('change', (newVal) => {
        store.commit('updateReplicant', {
            name: replicant.name,
            value: clone(newVal)
        });
    });

    replicants.set(name, replicant);
});

export async function create() {
    return NodeCG.waitForReplicants(...Array.from(replicants.values())).then(() => store);
}
