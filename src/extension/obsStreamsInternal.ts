import * as nodecgApiContext from './util/nodecg-api-context';
import { waitForReplicants } from "./util/waitForReplicants";
import { CapturePositions, CurrentGameLayout, ObsStreams, ObsStreamsInternal, SoundOnTwitchStream } from '../../schemas';
import { RunDataActiveRun } from '../../speedcontrol-types';
import { getStreamsForChannel } from './util/streamlink';
import { ChannelQuality } from 'types';

const nodecg = nodecgApiContext.get();

const logger = new nodecg.Logger(`${nodecg.bundleName}:obsStreamsInternal`);

// Twitch aspect ratio 1024x576

const runDataActiveRunReplicant = nodecg.Replicant <RunDataActiveRun>('runDataActiveRun', 'nodecg-speedcontrol');

const obsStreamsReplicant = nodecg.Replicant<ObsStreams>('obsStreams');
const obsStreamsInternalReplicant = nodecg.Replicant<ObsStreamsInternal>('obsStreamsInternal');
const soundOnTwitchStreamReplicant = nodecg.Replicant<number>('soundOnTwitchStream', { defaultValue: -1 });
const capturePositionsReplicant = nodecg.Replicant<CapturePositions>('capturePositions');
const currentGameLayoutReplicant = nodecg.Replicant<CurrentGameLayout>('currentGameLayout');

interface ObsStreamInternal {
    channel: string;
    x: number;
    y: number;
    width: number;
    height: number;
    originalWidth: number;
    originalHeight: number;
    cropTop: number;
    cropBottom: number;
    cropLeft: number;
    cropRight: number;
    quality: string;
    volume: number;
    muted: boolean;
    paused: boolean;
    visible: boolean;
    streamUrl: string;
    availableQualities: ChannelQuality[];
}

interface ObsStream {
    channel: string;
    widthPercent: number;
    heightPercent: number;
    topPercent: number;
    leftPercent: number;
    quality: string;
    volume: number;
    paused: boolean;
}

waitForReplicants([runDataActiveRunReplicant, obsStreamsInternalReplicant,
    obsStreamsReplicant, soundOnTwitchStreamReplicant,
    capturePositionsReplicant, currentGameLayoutReplicant], () => {

    soundOnTwitchStreamReplicant.on('change', newVal => {
        obsStreamsInternalReplicant.value.streams.forEach((stream, idx) => {
            stream.muted = (newVal != idx);
        });
    });

    obsStreamsReplicant.on('change', (newVal, oldVal) => {
        if (!oldVal) return;
        handleStreamChange(newVal, oldVal);
    });

    currentGameLayoutReplicant.on('change', (newVal, oldVal) => {
        if (!oldVal) return;
        obsStreamsInternalReplicant.value.layout = newVal.path;
        for (var i = 0; i < obsStreamsReplicant.value.length; i++) {
            handleStreamPosChange(obsStreamsInternalReplicant.value.streams[i], obsStreamsReplicant.value[i], i, newVal, capturePositionsReplicant.value);
        }
    });

    capturePositionsReplicant.on('change', (newVal, oldVal) => {
        if (!oldVal) return;
        for (var i = 0; i < obsStreamsReplicant.value.length; i++) {
            handleStreamPosChange(obsStreamsInternalReplicant.value.streams[i], obsStreamsReplicant.value[i], i, currentGameLayoutReplicant.value, newVal);
        }
    });

});

function defaultOnUndefined<T>(val: T | undefined, deflt: T): T {
    return val === undefined ? deflt : val;
}

function handleStreamChange(obsStreams: ObsStreams, oldStreams: ObsStreams) {
    let idx = 0;
    const newStreamsInternal: ObsStreamsInternal = {layout: "", streams: []};
    while (idx < obsStreams.length) {
        logger.info(`processing change stream ${idx}`);
        const newStream = obsStreams[idx];
        const oldStream = oldStreams[idx] || {};
        const oldStreamInternal = obsStreamsInternalReplicant.value.streams[idx] || {};
        const newStreamInternal = {
            channel: newStream.channel,
            x: defaultOnUndefined(oldStreamInternal.x, 0),
            y: defaultOnUndefined(oldStreamInternal.y, 0),
            width: defaultOnUndefined(oldStreamInternal.width, 100),
            height: defaultOnUndefined(oldStreamInternal.height, 100),
            originalWidth: defaultOnUndefined(oldStreamInternal.originalWidth, 100),
            originalHeight: defaultOnUndefined(oldStreamInternal.originalHeight, 100),
            cropTop: defaultOnUndefined(oldStreamInternal.cropTop, 0),
            cropBottom: defaultOnUndefined(oldStreamInternal.cropBottom, 0),
            cropLeft: defaultOnUndefined(oldStreamInternal.cropLeft, 0),
            cropRight: defaultOnUndefined(oldStreamInternal.cropRight, 0),
            quality: defaultOnUndefined(oldStreamInternal.quality, "quality"),
            volume: defaultOnUndefined(oldStreamInternal.volume, 1),
            muted: defaultOnUndefined(oldStreamInternal.muted, false),
            paused: defaultOnUndefined(oldStreamInternal.paused, false),
            visible: defaultOnUndefined(oldStreamInternal.visible, true),
            streamUrl: defaultOnUndefined(oldStreamInternal.streamUrl, ""),
            availableQualities: defaultOnUndefined(oldStreamInternal.availableQualities, []),
        };
        // handle streamname change
        if (newStream.channel !== oldStream?.channel) {
            logger.info("processing stream change");
            handleStreamNameChange(idx, newStream.channel);
        }
        // handle pos change
        if (newStream.heightPercent !== oldStream?.heightPercent ||
            newStream.widthPercent !== oldStream?.widthPercent || 
            newStream.topPercent !== oldStream?.topPercent || 
            newStream.leftPercent !== oldStream?.leftPercent) {
                logger.info("processing crop change");
                handleStreamPosChange(newStreamInternal, newStream, idx, currentGameLayoutReplicant.value, capturePositionsReplicant.value);
            }
        newStreamsInternal.streams[idx] = newStreamInternal;
        idx++;
    }
    obsStreamsInternalReplicant.value.streams = newStreamsInternal.streams;
}

// function works async, changes obsStreamInternal for the new channel name
function handleStreamNameChange(streamIdx: number, newChannelName: string) {
    getStreamsForChannel(newChannelName).then(channels => {
        logger.info("got streams for "+streamIdx);
        if (obsStreamsReplicant.value[streamIdx].channel !== newChannelName) {
            // the channel name changed, stop updating to the new channel name
            return;
        }
        const qualities: ChannelQuality[] = channels.filter(c => c.quality.includes("p"))
            .map(c => {
                const quality = c.quality;
                const height = parseInt(quality.slice(0, quality.indexOf("p")), 10); // format is like: 360p, 1080p60
                const width = height / 9 * 16; // let's assume 16:9 and kill everyone that uses a different aspect ratio...
                return {
                    name: quality,
                    width,
                    height,
                    masterUrl: c.masterUrl,
                    streamUrl: c.streamUrl,
                };
            });
        qualities.sort((a, b) => a.width - b.width);
        const internalStream = obsStreamsInternalReplicant.value.streams[streamIdx];
        internalStream.availableQualities = qualities;
        internalStream.quality = qualities[0].name; // best quality
        internalStream.streamUrl = qualities[0].streamUrl;
        internalStream.originalWidth = qualities[0].width;
        internalStream.originalHeight = qualities[0].height;
        handleStreamPosChange(internalStream, obsStreamsReplicant.value[streamIdx], streamIdx, currentGameLayoutReplicant.value, capturePositionsReplicant.value);
        obsStreamsInternalReplicant.value.streams[streamIdx] = internalStream;
    }).catch(e => {
        logger.error(e);
    });
}

// does NOT change any replicants
function handleStreamPosChange(streamInternal: ObsStreamInternal, stream: ObsStream, streamIdx: number, currentGameLayout: CurrentGameLayout, capturePositions: CapturePositions) {
    streamInternal.visible = true;
    const layoutName = currentGameLayout.path.slice(1); // leading slash we don't want
    const captureLayout = capturePositions[layoutName];
    if (captureLayout === undefined) {
        logger.error(`capture layout ${layoutName} not found!`);
        return;
    }
    const capturePos = captureLayout[`stream${streamIdx + 1}`];
    if (capturePos === undefined) {
        streamInternal.visible = false;
        logger.error(`capture pos for index ${streamIdx} not found on ${layoutName}!`);
        return;
    }

    const originalWidth = streamInternal.originalWidth;
    const originalHeight = streamInternal.originalHeight;

    // transform the percentages to cropping pixels
    streamInternal.cropLeft = stream.leftPercent / 100 * originalWidth;
    streamInternal.cropTop = stream.leftPercent / 100 * originalHeight;
    streamInternal.cropRight = (stream.widthPercent - 100) / 100 * originalWidth;
    streamInternal.cropBottom = (stream.heightPercent - 100) / 100 * originalHeight;
    streamInternal.x = capturePos.x;
    streamInternal.y = capturePos.y;
    streamInternal.width = capturePos.width;
    streamInternal.height = capturePos.height;
}
