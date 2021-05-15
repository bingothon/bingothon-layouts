import clone from 'clone';
import {ReplicantBrowser} from 'nodecg/types/browser'; // eslint-disable-line
import Vue from 'vue';
import Vuex from 'vuex';
import {
    AllCamNames,
    AllGameLayouts,
    AllInterviews,
    Bingoboard,
    BingoboardMeta,
    BingoboardMode,
    BingosyncSocket,
    CurrentCamNames,
    CurrentGameLayout,
    CurrentInterview,
    CurrentMainBingoboard,
    DiscordDelayInfo,
    DonationTotal,
    ExplorationBingoboard,
    HostingBingoboard,
    HostingBingosocket,
    HostsSpeakingDuringIntermission,
    LastIntermissionTimestamp,
    ObsAudioSources,
    ObsConnection,
    ObsDashboardAudioSources,
    ObsStreamMode,
    OriBingoboard,
    OriBingoMeta,
    ShowPictureDuringIntermission,
    SongData,
    SoundOnTwitchStream,
    TrackerDonations,
    TrackerOpenBids,
    TrackerPrizes,
    TwitchStreams,
    VoiceActivity
} from "../../schemas";
import {RunDataActiveRun, RunDataArray, Timer, TwitchCommercialTimer} from "../../speedcontrol-types";
import {Scene} from 'obs-websocket-js';

Vue.use(Vuex);

const replicantNames = [
    'allGameLayouts',
    'allInterviews',
    'allCamNames',
    'bingoboard',
    'bingoboardMeta',
    'bingoboardMode',
    'bingosyncSocket',
    'currentGameLayout',
    'currentInterview',
    'currentCamNames',
    'currentMainBingoboard',
    'donationTotal',
    'discordDelayInfo',
    'explorationBingoboard',
    'hostingBingoboard',
    'hostingBingosocket',
    'hostsSpeakingDuringIntermission',
    'lastIntermissionTimestamp',
    'obsAudioSources',
    'obsConnection',
    'obsDashboardAudioSources',
    'obsPreviewScene',
    'obsCurrentScene',
    'obsSceneList',
    'obsStreamMode',
    'oriBingoboard',
    'oriBingoMeta',
    'showPictureDuringIntermission',
    'soundOnTwitchStream',
    'trackerDonations',
    'trackerOpenBids',
    'trackerPrizes',
    'twitchStreams',
    'voiceActivity',
    'songData'
];
const nodecgSpeedcontrolReplicantNames = [
    'runDataActiveRun',
    'runDataArray',
    'timer',
    'twitchCommercialTimer'
]
const replicants: Map<string, ReplicantBrowser<any>> = new Map();

var playerAlternateInterval: NodeJS.Timeout | null = null;

export const store = new Vuex.Store({
    state: {
        // bingothon
        allGameLayouts: [] as AllGameLayouts,
        allInterviews: [] as AllInterviews,
        allCamNames: [] as AllCamNames,
        bingoboard: {} as Bingoboard,
        bingoboardMeta: {} as BingoboardMeta,
        bingoboardMode: {} as BingoboardMode,
        bingosyncSocket: {} as BingosyncSocket,
        currentGameLayout: {} as CurrentGameLayout,
        currentInterview: {} as CurrentInterview,
        currentCamNames: {} as CurrentCamNames,
        currentMainBingoboard: {} as CurrentMainBingoboard,
        discordDelayInfo: {} as DiscordDelayInfo,
        donationTotal: 0 as DonationTotal,
        explorationBingoboard: {} as ExplorationBingoboard,
        hostingBingoboard: {} as HostingBingoboard,
        hostingBingosocket: {} as HostingBingosocket,
        hostsSpeakingDuringIntermission: {} as HostsSpeakingDuringIntermission,
        lastIntermissionTimestamp: 0 as LastIntermissionTimestamp,
        obsAudioSources: {} as ObsAudioSources,
        obsConnection: {} as ObsConnection,
        obsDashboardAudioSources: {} as ObsDashboardAudioSources,
        obsPreviewScene: null as null | string,
        obsCurrentScene: null as null | string,
        obsSceneList: null as null | Scene[],
        obsStreamMode: '' as ObsStreamMode,
        oriBingoboard: {} as OriBingoboard,
        oriBingoMeta: {} as OriBingoMeta,
        showPictureDuringIntermission: {} as ShowPictureDuringIntermission,
        soundOnTwitchStream: 0 as SoundOnTwitchStream,
        trackerDonations: [] as TrackerDonations,
        trackerOpenBids: [] as TrackerOpenBids,
        trackerPrizes: [] as TrackerPrizes,
        twitchStreams: [] as TwitchStreams,
        voiceActivity: {} as VoiceActivity,
        songData: {} as SongData,
        // nodecg-speedcontrol
        runDataActiveRun: {} as RunDataActiveRun,
        runDataArray: [] as RunDataArray,
        timer: {} as Timer,
        twitchCommericalTimer: {} as TwitchCommercialTimer,
        // timer
        playerAlternate: true,
    },
    mutations: {
        updateReplicant(state, {name, value}) {
            Vue.set(state, name, value);
        },
        startPlayerAlternateInterval(state, interval) {
            if (playerAlternateInterval) {
                clearInterval(playerAlternateInterval);
            }
            playerAlternateInterval = setInterval(() => {
                Vue.set(state, 'playerAlternate', !state.playerAlternate);
            }, interval);
        },
        stopPlayerAlternateInterval(state) {
            if (playerAlternateInterval) {
                clearInterval(playerAlternateInterval);
            }
            playerAlternateInterval = null;
        }
    },
});

store.commit('startPlayerAlternateInterval', 10000);

/**
 * Gets the raw replicant, only intended for modifications, to use values use state
 * @param replicant name of the replicant, throws an error if it isn't found
 */
export function getReplicant<T>(replicant: string): ReplicantBrowser<T> {
    const rep = replicants.get(replicant);
    if (!rep) {
        throw new Error("invalid replicant!");
    }
    return rep;
}

replicantNames.forEach((name) => {
    const replicant = nodecg.Replicant(name);

    replicant.on('change', (newVal) => {
        store.commit('updateReplicant', {
            name: replicant.name,
            value: clone(newVal),
        });
    });

    replicants.set(name, replicant);
});

nodecgSpeedcontrolReplicantNames.forEach(name => {
    const rep = nodecg.Replicant(name, 'nodecg-speedcontrol');

    rep.on('change', newVal => {
        store.commit('updateReplicant', {
            name: rep.name,
            value: clone(newVal),
        });
    });

    replicants.set(name, rep);
})

export async function create() {
    return NodeCG.waitForReplicants(...Array.from(replicants.values())).then(() => store);
}
