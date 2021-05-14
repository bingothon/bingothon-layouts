<template>
    <v-app>
        <div
            v-for="(stream, i) in twitchStreams"
            :key="i"
        >
            <span class="stream-label">Player {{ i }}:</span>
            <v-btn
                class="stream-mute"
                dark
                small
                @click="muteChange(i)"
            >
                <v-icon v-if="i === soundOnTwitchStream">
                    mdi-volume-off
                </v-icon>
                <v-icon v-else>
                    mdi-volume-high
                </v-icon>
            </v-btn>
            <v-btn
                class="stream-refresh"
                dark
                small
                @click="refresh(i)"
            >
                <v-icon>
                    mdi-refresh
                </v-icon>
            </v-btn>
            <v-btn
                class="stream-pause"
                dark
                small
                @click="togglePlayPause(i)"
            >
                <v-icon v-if="stream.paused">
                    mdi-play
                </v-icon>
                <v-icon v-else>
                    mdi-pause
                </v-icon>
            </v-btn>
            <div>
                <span>Vol: </span>
                <v-slider
                    class="stream-volume"
                    min="0"
                    max="100"
                    :value="stream.volume*100"
                    @change="volumeChange(i,$event)"
                />
            </div>
            <div>
                <v-text-field v-model="twitchChannelOverrides[i]"
                              single-line
                              solo
                              dark
                              type="text"
                              :background-color="'#455A64'"/>
                <v-btn @click="overrideChannelName(i)"
                       :style="'margin: 2px'"
                >
                    Override stream
                </v-btn>
            </div>
        </div>
    </v-app>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import {nodecg} from '../../browser-util/nodecg';
import {
    TwitchStreams,
} from '../../../schemas';
import {store, getReplicant} from '../../browser-util/state';

const bingothonBundleName = 'bingothon-layouts';

@Component({})
export default class TwitchControl extends Vue {
    twitchChannelOverrides: string[] = ['', '', '', ''];

    get twitchStreams(): TwitchStreams {
        return store.state.twitchStreams;
    }

    get soundOnTwitchStream(): number {
        return store.state.soundOnTwitchStream;
    }

    volumeChange(id: number, newVal: number) {
        const newVolume = newVal / 100;
        nodecg.sendMessageToBundle('streams:setStreamVolume', bingothonBundleName, {id, volume: newVolume});
    }

    updateStreamQuality(id: number, event: any) {
        nodecg.sendMessageToBundle('streams:setStreamQuality', bingothonBundleName, {id, quality: event.target.value});
    }

    muteChange(id: number) {
        if (this.soundOnTwitchStream === id) {
            nodecg.sendMessageToBundle('streams:setSoundOnTwitchStream', bingothonBundleName, -1);
        } else {
            nodecg.sendMessageToBundle('streams:setSoundOnTwitchStream', bingothonBundleName, id);
        }
    }

    togglePlayPause(id: number) {
        nodecg.sendMessageToBundle('streams:toggleStreamPlayPause', bingothonBundleName, id);
    }

    refresh(id: number) {
        nodecg.sendMessageToBundle('streams:refreshStream', bingothonBundleName, id);
    }

    overrideChannelName(id: number) {
        getReplicant<TwitchStreams>('twitchStreams').value[id].channel = this.twitchChannelOverrides[id];
    }
}
</script>

<style>

</style>
