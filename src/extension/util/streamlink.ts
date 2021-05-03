import { exec } from "child_process";

export interface StreamlinkStream {
    quality: string, // TODO: can be made an enum?
    type: string, // TODO: is this always hls?
    streamUrl: string,
    masterUrl: string, // different urls, idk what the difference is
};

interface RawStreamlinkEntry {
    type: string,
    url: string,
    master: string,
};

export function getStreamsForChannel(channel: string): Promise<StreamlinkStream[]> {
    return new Promise((resolve, reject) => {
        exec(`streamlink --json twitch.tv/${channel}`,(error, stdout) => {
            if (error && error.code !== 1) { // error code 1 means channel not found
                reject(error);
                return;
            } else {
                const stdoutJson = JSON.parse(stdout);
                if (stdoutJson.error !== undefined) {
                    reject(stdoutJson.error);
                    return;
                }
                if (stdoutJson.plugin !== "twitch") {
                    reject("can only handle twitch streams!");
                    return;
                }
                const streams = Object.entries(stdoutJson.streams).map(([quality, stream]): StreamlinkStream => {
                    const streamLinkStream = stream as RawStreamlinkEntry;
                    return {
                        masterUrl: streamLinkStream.master,
                        quality: quality,
                        streamUrl: streamLinkStream.url,
                        type: streamLinkStream.type,
                    };
                });
                resolve(streams);
                return;
            }
        });
    });
}