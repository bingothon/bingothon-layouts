<template>
    <div id="countdown">
        <div id="background"></div>
        <countdown-timer id="countdown-timer"></countdown-timer>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { store } from '@/browser-util/state';
import CountdownTimer from '../components/countdownTimer.vue';

    @Component({
        components: {
            CountdownTimer
        }
    })
    export default class Countdown extends Vue {
        
    }
</script>

<style>
    body {
        margin: 0;
        padding: 0;
    }
    #background {
        width: 1920px;
        height: 1080px;
        background-size: cover;
        background-repeat: no-repeat;
        background-image: linear-gradient(grey, #554d4d);
        filter: sepia(100%) saturate(360%) brightness(40%) hue-rotate(298deg) blur(3px);
    }
    #countdown-timer {
        position: absolute;
        top: 500px;
        left: 500px;
    }
</style>
