<template>
    <div id="PlayerContainer">
        <video ref="VideoPlayer" id="player">
            <source ref="PlayerSrc" />
        </video>
        <div v-if="nextRun" id="upcoming">
            <div id="next">Coming Up Next:</div>
            <div id="run">
                <div id="fit">
                    <text-fit :text="`${nextRun.game} - ${nextRun.category}`"></text-fit>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Ref, Vue, Watch } from 'vue-property-decorator';
    import { Asset } from '@/schemas';
    import { store } from '@/browser-util/state';
    import { RunData } from '../../../speedcontrol-types';
    import TextFit from '../helpers/text-fit.vue';

    @Component({
        components: {
            TextFit,
        },
    })
    export default class VideoPlayer extends Vue {
        video: Asset;
        index = 0;
        @Ref('VideoPlayer') player: HTMLVideoElement;
        @Ref('PlayerSrc') playerSrc: HTMLSourceElement;

        get nextRun(): RunData {
            return store.state.runDataActiveRun;
        }

        get playlist(): string[] {
            return store.state.runDataActiveRun.customData.playlist.split(',');
        }

        get videos(): Asset[] {
            return store.state['assets:intermissionVideos'];
        }

        get domain(): string {
            return window.location.host;
        }

        get currentObsScene(): string {
            return store.state.obsCurrentScene;
        }

        @Watch('currentObsScene', { immediate: true })
        onOBSSceneChanged(newVal: string) {
            this.$nextTick(() => {
                if (newVal === 'videoPlayer') {
                    this.index = 0;
                    this.playNextVideo();
                }
            });
        }

        nextVideoExists(): boolean {
            console.log(`CHecking for new video, Playlist: ${this.playlist}, Index: ${this.index}`);
            return this.playlist && this.index + 1 < this.playlist.length;
        }

        returnToIntermission() {
            // only send Message if videoPlayer is the active scene, avoids duplication and unnecessary scene switching
            if (this.currentObsScene === 'videoPlayer') {
                nodecg.sendMessage('videoPlayerFinished');
            }
        }

        async playNextVideo(): Promise<void> {
            let video: Asset;
            if (this.playlist && this.playlist[this.index]) {
                console.log(JSON.stringify(this.videos));
                video = this.videos.find((video) => {
                    return video.name === this.playlist[this.index].trim();
                });
            }
            if (!video) {
                //check if there's more in the playlist
                if (this.nextVideoExists()) {
                    this.index += 1;
                    await this.playNextVideo();
                } else {
                    this.returnToIntermission();
                }
                return;
            }
            this.video = video;
            this.playerSrc.src = video.url;
            this.playerSrc.type = `video/${video.ext.toLowerCase().replace('.', '')}`;
            this.player.load();
            await this.player.play();
        }

        videoEnded() {
            console.log('Video Ended');
            if (this.nextVideoExists()) {
                this.index += 1;
                this.playNextVideo();
                return;
            }
            this.returnToIntermission();
        }

        mounted() {
            this.player.addEventListener('ended', this.videoEnded);
        }
    }
</script>

<style>
    #PlayerContainer {
        height: 900px;
        overflow: hidden;
    }

    body {
        /*background: linear-gradient(var(--darker-main-color), var(--lighter-main-color) 80%, var(--darker-main-color));*/
        /* background-image: url("../../../static/bg-new.jpg"); */
        background: linear-gradient(-128deg, var(--gradient-light) 0, var(--gradient-dark) 100%) 100% no-repeat fixed;
    }

    #player {
        position: absolute;
        top: 30px;
        left: 124px; /* (1920 - width) / 2 */
        width: 1671px; /* height / 1080 * 1920 */
        height: 940px; /* 1080 - (80 + 2*top) */
    }

    #upcoming {
        position: absolute;
        top: 1000px;
        left: 124px;
        width: 1000px;
        height: 100px;
        font-weight: 500;
        line-height: 60px;
        color: #fff;
        font-size: 41px;
        text-transform: uppercase;
    }

    #next {
        padding-left: 10px;
        background-image: linear-gradient(
            var(--darker-main-color) 0%,
            var(--darker-main-color) 50%,
            rgba(0, 0, 0, 0.5) 100%
        );
        /* background-image: linear-gradient(rgba(0, 0, 0, 0.5) 0%, var(--darker-main-color) 33%, var(--darker-main-color) 66%, rgba(0, 0, 0, 0.5) 100%); */
        width: 400px;
    }

    #run {
        position: absolute;
        padding-left: 10px;
        padding-right: 10px;
        top: 0px;
        left: 410px;
        background-image: linear-gradient(
            var(--darker-main-color) 0%,
            var(--darker-main-color) 50%,
            rgba(0, 0, 0, 0.5) 100%
        );
        width: 1240px;
        /* Don't ask why, text fit does weird things*/
        height: 60px;
    }

    #fit {
        top: 20px;
        height: 100px;
    }
</style>
