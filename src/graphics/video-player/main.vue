<template>
    <div id="App">
        <video ref="VideoPlayer" id="player">
            <source ref="PlayerSrc">
        </video>
    </div>

</template>

<script lang="ts">
import {Component, Ref, Vue, Watch} from "vue-property-decorator";
import {Asset} from "../../../schemas";
import {store} from "../../browser-util/state";

type VideoTypeEnum = ("charity" | "sponsor")

@Component({})
export default class VideoPlayer extends Vue {
    video: Asset;
    videoType : VideoTypeEnum = "charity";
    @Ref('VideoPlayer') player: HTMLVideoElement;
    @Ref('PlayerSrc') playerSrc: HTMLSourceElement;

    get charityVideos(): Asset[] {
        return store.state["assets:intermissionVideos"];
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
                this.videoType = "charity";
                this.playNextVideo("charity")
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
            this.player.load();
            this.player.play();
        } else {
            //something went wrong, play next video
            if (type === "charity") {
                store.state.intermissionVideos.charityVideoIndex = (store.state.intermissionVideos.charityVideoIndex + 1) % this.charityVideos.length;
            } else {
                store.state.intermissionVideos.sponsorVideoIndex = (store.state.intermissionVideos.sponsorVideoIndex + 1) % this.sponsorVideos.length;
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

<style scoped>

#player {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 1920px;
    height: 1080px;
}

</style>
