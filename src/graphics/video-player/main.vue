<template>
    <div id="App">
        <video ref="VideoPlayer" id="player">
            <source ref="PlayerSrc">
        </video>
    </div>

</template>

<script lang="ts">
import {Ref, Vue, Watch} from "vue-property-decorator";
import {Asset} from "../../../schemas";
import {store} from "../../browser-util/state";


export default class VideoPlayer extends Vue {
    videoIndex: number = 0;
    video: Asset;
    @Ref('VideoPlayer') player: HTMLVideoElement;
    @Ref('PlayerSrc') playerSrc: HTMLSourceElement;

    get videos(): Asset[] {
        return store.state["assets:intermissionVideos"];
    }

    get domain(): string {
        return window.location.host;
    }

    get currentObsScene(): string  {
        return store.state.obsCurrentScene
    }

    @Watch('currentObsScene', {immediate: true})
    onOBSSceneChanged(newVal : string){
        if (newVal === 'VideoPlayer') {
            this.playNextVideo()
        }
    }

    get compVideoIndex(): number {
        return this.videoIndex;
    }

    async playNextVideo(): Promise<void> {
        const video = this.videos[this.videoIndex];
        if (video) {
            this.video = video;
            this.playerSrc.src = video.url;
            this.playerSrc.type = `video/${video.ext.toLowerCase().replace('.', '')}`;
            this.player.load();
            this.player.play();
        } else {
            //something went wrong, play next video
            if (this.videos.length - 1 > this.videoIndex) {
                this.videoIndex += 1;
            } else {
                // End of playlist.
                this.videoIndex = 0;
            }
            this.playNextVideo();
        }
    }

    videoEnded(): void {
        if (this.videos.length - 1 > this.videoIndex) {
            this.videoIndex += 1;
        } else {
            // End of playlist.
            this.videoIndex = 0;
        }
        nodecg.sendMessage('videoPlayerFinished');
        //TODO transition back to intermission
    }

    mounted() {
        this.videoIndex = 0;
        console.log(this.videoIndex)
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
