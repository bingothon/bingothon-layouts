<template>
    <div id="discussion">
        <div id="background"></div>
        <div id="player-info-container">
            <score-player-info class="player-info" height="50px" :playerIndex="0"></score-player-info>
            <score-player-info class="player-info" height="50px" :playerIndex="1"></score-player-info>
            <score-player-info class="player-info" height="50px" :playerIndex="2"></score-player-info>
            <score-player-info class="player-info" height="50px" :playerIndex="3"></score-player-info>
            <score-player-info class="player-info" height="50px" :playerIndex="4"></score-player-info>
        </div>
        <discord-voice-display
            id="discord-voice"
            iconHeight="50px"
            nameWidth="300px"
            maxUserCount="4"
            :removePlayers="true"
        ></discord-voice-display>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { store } from '@/browser-util/state';
    import TextFit from '../helpers/text-fit.vue';
    import ScorePlayerInfo from '../components/ScorePlayerInfo.vue';
    import DiscordVoiceDisplay from '../components/discordVoiceDisplay.vue';

    @Component({
        components: {
            TextFit,
            ScorePlayerInfo,
            DiscordVoiceDisplay,
        }
    })
    export default class Discussion extends Vue {
        
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
    #player-info-container {
        position: absolute;
        top: 1000px;
        left: 0;
        display: flex;
        width: 1910px;
    }
    .player-info {
        margin-left: 10px;
        width: 600px;
    }
    #discord-voice {
        position: absolute;
        top: 398px;
        left: 538px;
        width: 1000px;
    }
</style>
