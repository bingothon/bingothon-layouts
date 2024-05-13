<template>
    <div id="TwitchPlayers">
        <div v-for="(stream, streamIndex) in streams" :key="streamIndex" class="TwitchPlayerContainer">
            <TwitchPlayer :style="capturePositionStyles(streamIndex)" :streamIndex="streamIndex" />
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { CapturePositions, TwitchStream } from '@/schemas';
    import { store } from '@/browser-util/state';
    import TextFit from '../helpers/text-fit.vue';
    import TwitchPlayer from '../components/twitchPlayer.vue';

    @Component({
        components: {
            TextFit,
            TwitchPlayer
        }
    })
    export default class TwitchPlayers extends Vue {
        mounted() {}

        get capturePositions(): CapturePositions[string] | undefined {
            const layoutName = store.state.currentGameLayout.path.slice(1); // leading slash we don't want
            return store.state.capturePositions[layoutName];
        }

        capturePosition(streamIdx: number) {
            return this.capturePositions[`stream${streamIdx + 1}`];
        }

        capturePositionStyles(streamIdx: number) {
            const position = this.capturePosition(streamIdx);
            console.log('pos', position);
            if (!position) {
                return {
                    visibility: 'hidden',
                    position: 'absolute'
                };
            } else {
                const pos = {
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: `${position.width}px`,
                    height: `${position.height}px`,
                    position: 'absolute'
                };
                console.log('pos', pos);
                return pos;
            }
        }

        get streams(): TwitchStream[] {
            return store.state.twitchStreams;
        }
    }
</script>

<style>
    body {
        background: none;
    }
</style>
