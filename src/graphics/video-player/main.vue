<template>
    <div id="App">
        <video ref="VideoPlayer" id="player">
            <source ref="PlayerSrc">
        </video>
    </div>

</template>

<script lang="ts">
import {Component, Ref, Vue, Watch} from "vue-property-decorator";
import {Asset, IntermissionVideos} from "../../../schemas";
import {store} from "../../browser-util/state";

@Component({})
export default class VideoPlayer extends Vue {
    videoIndex: number = 0;
    video: {name: string, path: string};
    @Ref('VideoPlayer') player: HTMLVideoElement;
    @Ref('PlayerSrc') playerSrc: HTMLSourceElement;

    get videos(): IntermissionVideos {
        return store.state.intermissionVideos;
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
            if (newVal === 'VideoPlayer') {
                this.playNextVideo()
            }
        });
    }

    get compVideoIndex(): number {
        return this.videoIndex;
    }

    async playNextVideo(): Promise<void> {
        const video = this.videos[this.videoIndex];
        if (video) {
            this.video = video;
            this.playerSrc.src = `/bundles/${nodecg.bundleName}/`+video.path;
            const ext = video.name.slice(video.name.lastIndexOf(".")+1);
            this.playerSrc.type = `video/${ext.toLowerCase()}`;
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
