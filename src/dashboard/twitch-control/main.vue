<template>
    <v-app>
        <div v-for="(stream, i) in twitchStreams" :key="i">
            <div class="stream-label">{{ getStreamLabel(i, playerNames, twitchStreams) }}:</div>
            <v-btn
                class="stream-mute"
                dark
                small
                @click="muteChange(i)"
                :title="i === soundOnTwitchStream ? 'currently unmuted' : 'currently muted'"
            >
                <v-icon v-if="i === soundOnTwitchStream"> mdi-volume-high </v-icon>
                <v-icon v-else> mdi-volume-off </v-icon>
            </v-btn>
            <v-btn class="stream-refresh" dark small @click="refresh(i)">
                <v-icon> mdi-refresh </v-icon>
            </v-btn>
            <v-btn class="stream-pause" dark small @click="togglePlayPause(i)">
                <v-icon v-if="stream.paused"> mdi-play </v-icon>
                <v-icon v-else> mdi-pause </v-icon>
            </v-btn>
            <div>
                <span>Vol: </span>
                <v-slider
                    class="stream-volume"
                    min="0"
                    max="100"
                    :value="stream.volume * 100"
                    @change="volumeChange(i, $event)"
                />
                <v-progress-linear
                    :color="obsAudioLevel(i) > 95 ? 'red' : 'green'"
                    class="stream-volume-multiplier"
                    min="0"
                    max="100"
                    :value="obsAudioLevel(i)"
                />
            </div>
            <div>
                <v-text-field
                    v-model="twitchChannelOverrides[i]"
                    label="Channel override"
                    hide-details
                    filled
                    dark
                    type="text"
                    :background-color="'#455A64'"
                />
                <v-btn @click="overrideChannelName(i)" :style="'margin: 2px'"> Override stream </v-btn>
            </div>
        </div>
    </v-app>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { TwitchStreams } from '../../../schemas';
    import { getReplicant, store } from '../../browser-util/state';

    const bingothonBundleName = 'bingothon-layouts';

    @Component({})
    export default class TwitchControl extends Vue {
        volumeBackgroundColor: 'red';

        twitchChannelOverrides: string[] = ['', '', '', ''];

        get twitchStreams(): TwitchStreams {
            return store.state.twitchStreams;
        }

        get soundOnTwitchStream(): number {
            return store.state.soundOnTwitchStream;
        }

        get playerNames(): string[] {
            let arr = [];
            store.state.runDataActiveRun.teams.forEach((t) => {
                t.players.forEach((p) => {
                    arr.push(p.name);
                });
            });
            return arr;
        }

        get obsAudioLevels() {
            return store.state.obsAudioLevels;
        }

        obsAudioLevel(stream: number): number {
            return this.obsAudioLevels?.[`twitch-stream-${stream}`]?.volume ?? 0;
        }

        volumeChange(id: number, newVal: number) {
            const newVolume = newVal / 100;
            nodecg.sendMessageToBundle('streams:setStreamVolume', bingothonBundleName, { id, volume: newVolume });
        }

        updateStreamQuality(id: number, event: any) {
            nodecg.sendMessageToBundle('streams:setStreamQuality', bingothonBundleName, {
                id,
                quality: event.target.value
            });
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

        getStreamLabel(idx: number, playerNames: string[], twitchStreams: TwitchStreams): string {
            return `${idx}: ${playerNames[idx]} (${twitchStreams[idx]?.channel})`;
        }
    }
</script>

<style>
    .stream-volume-multiplier {
        margin-top: -28px;
        margin-bottom: 10px;
    }
</style>
