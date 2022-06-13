<template>
    <div id="PlayerContainer">
        <video ref="VideoPlayer" id="player">
            <source ref="PlayerSrc">
        </video>
    </div>

</template>

<script lang="ts">
import {Component, Ref, Vue, Watch} from "vue-property-decorator";
import {Asset, CurrentGameLayout, IntermissionVideos} from "../../../schemas";
import {getReplicant, store} from "../../browser-util/state";

type VideoTypeEnum = ("charity" | "sponsor")

@Component({})
export default class VideoPlayer extends Vue {
    video: Asset;
    videoType : VideoTypeEnum = "charity";
    @Ref('VideoPlayer') player: HTMLVideoElement;
    @Ref('PlayerSrc') playerSrc: HTMLSourceElement;

    get charityVideos(): Asset[] {
        return store.state["assets:charityVideos"];
    }

    get sponsorVideos(): Asset[] {
        return store.state["assets:sponsorVideos"];
    }

    get domain(): string {
        return window.location.host;
    }

    get currentObsScene(): string  {
        return store.state.obsCurrentScene;
    }

    @Watch('currentObsScene', {immediate: true})
    onOBSSceneChanged(newVal : string){
        this.$nextTick(() => {
            if (newVal === 'videoPlayer') {
                // no charity videos for UAR
                this.videoType = "sponsor";
                this.playNextVideo("sponsor")
            }
        });
    }

    async playNextVideo(type: VideoTypeEnum): Promise<void> {
        let video;
        if (type === "charity") {
            video = this.charityVideos[store.state.intermissionVideos.charityVideoIndex];
        } else {
            video = this.sponsorVideos[store.state.intermissionVideos.sponsorVideoIndex];
        }
        if (video) {
            this.video = video;
            this.playerSrc.src = video.url;
            this.playerSrc.type = `video/${video.ext.toLowerCase().replace('.', '')}`;
            if  (type === 'charity') {
                this.player.volume = 1;
            } else {
                this.player.volume = 0.5;
            }
            this.player.load();
            this.player.play();
        } else {
            //something went wrong, play next video
            if (type === "charity") {
                getReplicant<IntermissionVideos>('intermissionVideos').value.charityVideoIndex = (store.state.intermissionVideos.charityVideoIndex + 1) % this.charityVideos.length;
            } else {
                getReplicant<IntermissionVideos>('intermissionVideos').value.sponsorVideoIndex = (store.state.intermissionVideos.sponsorVideoIndex + 1) % this.sponsorVideos.length;
            }
            this.playNextVideo(type);
        }
    }

    videoEnded(): void {
        // console.log("video ended!");
        if (this.videoType === "charity") {
            store.state.intermissionVideos.charityVideoIndex = (store.state.intermissionVideos.charityVideoIndex + 1) % this.charityVideos.length;
            this.playNextVideo("sponsor");
            this.videoType = "sponsor";
        } else {
            store.state.intermissionVideos.sponsorVideoIndex = (store.state.intermissionVideos.sponsorVideoIndex + 1) % this.sponsorVideos.length;
            nodecg.sendMessage('videoPlayerFinished');
        }
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
    background-image: url("../../../static/bg-new.jpg");
}

#player {
    position: absolute;
    top: 30px;
    left: 124px; /* (1920 - width) / 2 */
    width: 1671px; /* height / 1080 * 1920 */
    height: 940px; /* 1080 - (80 + 2*top) */
}

</style>
