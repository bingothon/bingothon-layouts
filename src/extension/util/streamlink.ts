import { exec } from 'child_process';
import { get } from './nodecg-api-context';

export interface StreamlinkStream {
    quality: string; // TODO: can be made an enum?
    type: string; // TODO: is this always hls?
    streamUrl: string;
    masterUrl: string; // different urls, idk what the difference is
    streamStart: string | undefined;
}

interface RawStreamlinkEntry {
    type: string;
    url: string;
    master: string;
}

const nodecg = get();
const log = new nodecg.Logger(`${nodecg.bundleName}:streamlink`);

export function getStreamsForChannel(channel: string): Promise<StreamlinkStream[]> {
    return new Promise((resolve, reject) => {
        exec(`${nodecg.bundleConfig.twitchStreams?.streamlinkCommand ?? 'streamlink'} --json twitch.tv/${channel}`, (error, stdout) => {
            if (error && error.code !== 1) {
                // error code 1 means channel not found
                reject(error);
                return;
            } else {
                const stdoutJson = JSON.parse(stdout);
                if (stdoutJson.error !== undefined) {
                    reject(stdoutJson.error);
                    return;
                }
                if (stdoutJson.plugin !== 'twitch') {
                    reject('can only handle twitch streams!');
                    return;
                }
                const streamStart = stdoutJson.metadata.stream_start as string | undefined;
                if (!streamStart) {
                    // uv tool install https://github.com/lepelog/streamlink/archive/refs/heads/twitch-stream-start.zip
                    log.warn(`no stream start, is the correct streamlink version installed?`);
                }
                const streams = Object.entries(stdoutJson.streams).map(([quality, stream]): StreamlinkStream => {
                    const streamLinkStream = stream as RawStreamlinkEntry;
                    return {
                        masterUrl: streamLinkStream.master,
                        quality: quality,
                        streamUrl: streamLinkStream.url,
                        type: streamLinkStream.type,
                        streamStart
                    };
                });
                resolve(streams);
                return;
            }
        });
    });
}
