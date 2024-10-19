<template>
    <div id="Intro">
        <div>
            <video autoplay class="bgvid" loop muted>
                <source src="/bundles/score-layouts/static/Loop_v1_1.mp4" type="video/mp4" />
            </video>
        </div>
        <div class="soom FlexContainer">Starting soon</div>
        <div id="matchupC">
            <div class="matchupName">
                Bingothon Taskmaster
            </div>
        </div>
        <div id="Countdown">
            <countdown></countdown>
        </div>
        <info-storage-box id="Music">
            <music></music>
        </info-storage-box>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import { RunData } from '../../../speedcontrol-types';
    import { store } from '../../browser-util/state';
    import Music from './Music.vue';
    import Countdown from '../components/countdownTimer.vue';
import InfoStorageBox from '../_misc/components/InfoStorageBox.vue';

    @Component({
        components: {
            Music,
            Countdown,
            InfoStorageBox,
        }
    })
    export default class CountdownLayout extends Vue {
    }
</script>

<style>
    #Intro {
        position: absolute;
        top: 0px;
        left: 0px;
        height: 1080px;
        width: 1920px;
    }

    video {
        object-fit: cover;
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
    }

    .bgvid {
        object-fit: cover;
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
    }

    .soom {
        position: absolute;
        left: 0px;
        width: 1920px;
        align-content: center;
        top: 200px;
        font-size: 50px;
        color: white;
        text-shadow: 3px 3px 5px black;
    }

    #matchupC {
        position: absolute;
        left: 0px;
        width: 1920px;
        align-content: center;
        top: 300px;
        font-size: 50px;
        color: white;
        text-align: center;
        text-shadow: 3px 3px 5px black;
    }

    #Countdown {
        position: absolute;
        left: 0px;
        width: 1920px;
        align-content: center;
        top: 620px;
        font-size: 100px;
        color: white;
        text-align: center;
        text-shadow: 3px 3px 5px black;
    }

    #Music {
        position: absolute;
        justify-content: flex-start;
        flex-direction: row;
        background-color: rgba(0, 0, 0, 0.3);
        left: 1400px;
        top: 940px;
        width: 1920px;
        height: 60px;
        font-size: 30px;
        color: white;
    }
</style>