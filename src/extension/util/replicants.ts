import {
    AllGameLayouts,
    Asset,
    Bingoboard,
    BingoboardMeta,
    BingoboardMode,
    BingosyncSocket,
    CapturePositions,
    CurrentGameLayout,
    DiscordDelayInfo,
    DonationTotal,
    ExplorationBingoboard,
    ExternalBingoboard,
    ExternalBingoboardMeta,
    HostsSpeakingDuringIntermission,
    LastIntermissionTimestamp,
    ObsAudioLevels,
    ObsAudioSources,
    ObsConnection,
    ObsDashboardAudioSources,
    ObsPreviewImg,
    ObsSceneList,
    ObsStreamMode,
    ShowPictureDuringIntermission,
    SongData,
    TrackerDonations,
    TrackerOpenBids,
    TrackerPrizes,
    TwitchChatBotData,
    TwitchStream,
    VoiceActivity
} from 'schemas';
import type NodeCGTypes from '@nodecg/types';
import { get as nodecg } from './nodecg-api-context';

/**
 * This is where you can declare all your replicant to import easily into other files,
 * and to make sure they have any correct settings on startup.
 */

export const boardMetaRep = nodecg().Replicant<BingoboardMeta>('bingoboardMeta') as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<BingoboardMeta>;
export const bingoboardModeRep = nodecg().Replicant<BingoboardMode>(
    'bingoboardMode'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<BingoboardMode>;
export const boardRep = nodecg().Replicant<Bingoboard>('bingoboard') as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<Bingoboard>;
export const socketRep = nodecg().Replicant<BingosyncSocket>('bingosyncSocket') as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<BingosyncSocket>;
export const explorationBoardRep = nodecg().Replicant<ExplorationBingoboard>(
    'explorationBingoboard'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<ExplorationBingoboard>;
export const externalBoardRep = nodecg().Replicant<ExternalBingoboard>(
    'externalBingoboard'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<ExternalBingoboard>;
export const externalBingoboardMetaRep = nodecg().Replicant<ExternalBingoboardMeta>(
    'externalBingoboardMeta'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<ExternalBingoboardMeta>;
export const donationTotalReplicant = nodecg().Replicant<DonationTotal>(
    'donationTotal'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<DonationTotal>;
export const openBidsReplicant = nodecg().Replicant<TrackerOpenBids>(
    'trackerOpenBids'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<TrackerOpenBids>;
export const donationsReplicant = nodecg().Replicant<TrackerDonations>(
    'trackerDonations'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<TrackerDonations>;
export const prizesReplicant = nodecg().Replicant<TrackerPrizes>('trackerPrizes') as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<TrackerPrizes>;
export const allGameLayoutsRep = nodecg().Replicant<AllGameLayouts>(
    'allGameLayouts'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<AllGameLayouts>;
export const currentGameLayoutRep = nodecg().Replicant<CurrentGameLayout>(
    'currentGameLayout'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<CurrentGameLayout>;
export const songDataRep = nodecg().Replicant<SongData>('songData', { persistent: false }) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<SongData>;
export const obsCurrentSceneRep = nodecg().Replicant<string | null>('obsCurrentScene');
export const obsDashboardAudioSourcesRep = nodecg().Replicant<ObsDashboardAudioSources>(
    'obsDashboardAudioSources'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<ObsDashboardAudioSources>;
export const obsAudioSourcesRep = nodecg().Replicant<ObsAudioSources>(
    'obsAudioSources'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<ObsAudioSources>;
export const obsConnectionRep = nodecg().Replicant<ObsConnection>('obsConnection') as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<ObsConnection>;
export const obsStreamModeRep = nodecg().Replicant<ObsStreamMode>('obsStreamMode') as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<ObsStreamMode>;
export const discordDelayInfoRep = nodecg().Replicant<DiscordDelayInfo>(
    'discordDelayInfo'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<DiscordDelayInfo>;
export const obsPreviewScene = nodecg().Replicant<string>('obsPreviewScene') as unknown as NodeCGTypes.ServerReplicant<string>;
export const voiceDelayRep = nodecg().Replicant<number>('voiceDelay', {
    persistent: true,
    defaultValue: 0
}) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<number>;
export const streamsReplicant = nodecg().Replicant<TwitchStream[]>('twitchStreams', {
    defaultValue: []
}) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<TwitchStream[]>;
export const soundOnTwitchStream = nodecg().Replicant<number>('soundOnTwitchStream', {
    defaultValue: -1
}) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<number>;
export const hostDiscordDuringIntermissionRep = nodecg().Replicant<HostsSpeakingDuringIntermission>(
    'hostsSpeakingDuringIntermission'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<HostsSpeakingDuringIntermission>;
export const lastIntermissionTimestampRep = nodecg().Replicant<LastIntermissionTimestamp>(
    'lastIntermissionTimestamp'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<LastIntermissionTimestamp>;
export const obsPreviewImgRep = nodecg().Replicant<ObsPreviewImg>('obsPreviewImg') as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<ObsPreviewImg>;
export const twitchChatBotDataRep = nodecg().Replicant<TwitchChatBotData>(
    'twitchChatBotData'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<TwitchChatBotData>;
export const obsSceneListRep = nodecg().Replicant<ObsSceneList>('obsSceneList') as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<ObsSceneList>; // TODO: create a type Scene and replace 'any' with 'Scene[]'
export const capturePositionsRep = nodecg().Replicant<CapturePositions>(
    'capturePositions'
) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<CapturePositions>;
export const obsAudioLevels = nodecg().Replicant<ObsAudioLevels>('obsAudioLevels', {
    persistent: false
}) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<ObsAudioLevels>;
export const voiceActivityRep = nodecg().Replicant<VoiceActivity>('voiceActivity', {
    defaultValue: { members: [] },
    persistent: true
}) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<VoiceActivity>;
// These aren't used anywhere in the extension code, just gotta makre sure to declare them
nodecg().Replicant<ShowPictureDuringIntermission>('showPictureDuringIntermission');
nodecg().Replicant<CapturePositions>('capturePositions');
nodecg().Replicant<NodeCGTypes.AssetFile[]>('assets:intermissionVideos', { defaultValue: [] });
