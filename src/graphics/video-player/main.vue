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
    import { Component, Ref, Vue, Watch } from 'vue-property-decorator'
    import { Asset, IntermissionVideos } from '../../../schemas'
    import { getReplicant, store } from '../../browser-util/state'
    import { RunData } from '../../../speedcontrol-types'
    import TextFit from '../helpers/text-fit.vue'

    type VideoTypeEnum = 'charity' | 'sponsor'

    @Component({
        components: {
            TextFit,
        },
    })
    export default class VideoPlayer extends Vue {
        video: Asset
        videoType: VideoTypeEnum = 'charity'
        nextRun: RunData = store.state.runDataActiveRun
        @Ref('VideoPlayer') player: HTMLVideoElement
        @Ref('PlayerSrc') playerSrc: HTMLSourceElement

        get charityVideos(): Asset[] {
            return store.state['assets:charityVideos']
        }

        get sponsorVideos(): Asset[] {
            return store.state['assets:sponsorVideos']
        }

        get domain(): string {
            return window.location.host
        }

        get currentObsScene(): string {
            return store.state.obsCurrentScene
        }

        @Watch('currentObsScene', { immediate: true })
        onOBSSceneChanged(newVal: string) {
            this.$nextTick(() => {
                if (newVal === 'videoPlayer') {
                    this.nextRun = store.state.runDataActiveRun
                    this.videoType = 'charity'
                    this.playNextVideo(this.videoType)
                }
            })
        }

        async playNextVideo(type: VideoTypeEnum): Promise<void> {
            let video
            if (type === 'charity') {
                video = this.charityVideos[store.state.intermissionVideos.charityVideoIndex]
            } else {
                video = this.sponsorVideos[store.state.intermissionVideos.sponsorVideoIndex]
            }
            if (video) {
                this.video = video
                this.playerSrc.src = video.url
                this.playerSrc.type = `video/${video.ext.toLowerCase().replace('.', '')}`
                if (type === 'charity') {
                    this.player.volume = 1
                } else {
                    this.player.volume = 0.5
                }
                this.player.load()
                await this.player.play()
            } else {
                //something went wrong, play next video
                if (type === 'charity') {
                    getReplicant<IntermissionVideos>('intermissionVideos').value.charityVideoIndex =
                        (store.state.intermissionVideos.charityVideoIndex + 1) % this.charityVideos.length
                } else {
                    getReplicant<IntermissionVideos>('intermissionVideos').value.sponsorVideoIndex =
                        (store.state.intermissionVideos.sponsorVideoIndex + 1) % this.sponsorVideos.length
                }
                await this.playNextVideo(type)
            }
        }

        videoEnded(): void {
            // console.log("video ended!");
            if (this.videoType === 'charity') {
                store.state.intermissionVideos.charityVideoIndex =
                    (store.state.intermissionVideos.charityVideoIndex + 1) % this.charityVideos.length
                this.playNextVideo('sponsor')
                this.videoType = 'sponsor'
            } else {
                store.state.intermissionVideos.sponsorVideoIndex =
                    (store.state.intermissionVideos.sponsorVideoIndex + 1) % this.sponsorVideos.length
                nodecg.sendMessage('videoPlayerFinished')
            }
        }

        mounted() {
            this.player.addEventListener('ended', this.videoEnded)
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
