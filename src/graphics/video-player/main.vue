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

@Component({})
export default class VideoPlayer extends Vue {
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
        return store.state.obsCurrentScene;
    }

    @Watch('currentObsScene', {immediate: true})
    onOBSSceneChanged(newVal : string){
        this.$nextTick(() => {
            if (newVal === 'videoPlayer') {
                this.playNextVideo()
            }
        });
    }

    async playNextVideo(): Promise<void> {
        const video = this.videos[store.state.intermissionVideos.index];
        if (video) {
            this.video = video;
            this.playerSrc.src = video.url;
            this.playerSrc.type = `video/${video.ext.toLowerCase().replace('.', '')}`;
            this.player.load();
            this.player.play();
        } else {
            //something went wrong, play next video
            store.state.intermissionVideos.index = (store.state.intermissionVideos.index + 1) % this.videos.length;
            this.playNextVideo();
        }
    }

    videoEnded(): void {
        // console.log("video ended!");
        store.state.intermissionVideos.index = (store.state.intermissionVideos.index + 1) % this.videos.length;
        nodecg.sendMessage('videoPlayerFinished');
        //TODO transition back to intermission
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
