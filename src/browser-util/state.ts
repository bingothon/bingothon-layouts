import clone from 'clone';
import {ReplicantBrowser} from 'nodecg/types/browser'; // eslint-disable-line
import Vue from 'vue';
import { vuexfireMutations, firebaseAction } from "vuexfire";
import Vuex from 'vuex';
import {db} from "../extension/firebase"
import {
    AllCamNames,
    AllGameLayouts,
    AllInterviews,
    Asset,
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
    IntermissionVideos,
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
    TwitchChatBotData,
    TwitchStreams,
    VoiceActivity
} from "../../schemas";
import {RunDataActiveRun, RunDataArray, Timer, TwitchCommercialTimer} from "../../speedcontrol-types";
import {Scene} from 'obs-websocket-js';
import {Games} from "../../types";

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
    'intermissionVideos',
    'lastIntermissionTimestamp',
    'obsAudioSources',
    'obsConnection',
    'obsDashboardAudioSources',
    'obsPreviewScene',
    'obsCurrentScene',
    'obsSceneList',
    'obsStreamMode',
    'oriBingoMeta',
    'oriBingoboard',
    'showPictureDuringIntermission',
    'soundOnTwitchStream',
    'trackerDonations',
    'trackerOpenBids',
    'trackerPrizes',
    'twitchChatBotData',
    'twitchStreams',
    'voiceActivity',
    'voiceDelay',
    'songData'
];
const nodecgSpeedcontrolReplicantNames = [
    'runDataActiveRun',
    'runDataArray',
    'timer',
    'twitchCommercialTimer'
];

const assetNames = [
    'assets:intermissionVideos',
    'assets:wideLargeLogos',
    'assets:wideSmallLogos',
    'assets:squareLogos'
];
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
        intermissionVideos: {} as IntermissionVideos,
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
        twitchChatBotData: {} as TwitchChatBotData,
        twitchStreams: [] as TwitchStreams,
        voiceActivity: {} as VoiceActivity,
        voiceDelay: 0,
        songData: {} as SongData,
        // nodecg-speedcontrol
        runDataActiveRun: {} as RunDataActiveRun,
        runDataArray: [] as RunDataArray,
        timer: {} as Timer,
        twitchCommercialTimer: {} as TwitchCommercialTimer,
        // assets
        "assets:intermissionVideos": [] as Asset[],
        'assets:wideLargeLogos': [] as Asset[],
        'assets:wideSmallLogos': [] as Asset[],
        'assets:squareLogos': [] as Asset[],
        // timer
        playerAlternate: true,
        //firebase
        games: {} as Games,
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
        },
        vuexfireMutations
    },
    actions: {
        bindGames: firebaseAction(({ bindFirebaseRef }) => {
            // return the promise returned by `bindFirebaseRef`
            return bindFirebaseRef('games', db.ref('games'))
        }),
        unbindGames: firebaseAction(({ unbindFirebaseRef }) => {
            unbindFirebaseRef('games')
        }),
    }
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

assetNames.forEach((name) => {
    const rep = nodecg.Replicant(name)
    rep.on('change', newValue => {
        store.commit('updateReplicant', {
            name: rep.name,
            value: clone(newValue),
        });
    });
    replicants.set(name, rep);
});

export async function create() {
    return NodeCG.waitForReplicants(...Array.from(replicants.values())).then(() => store);
}
