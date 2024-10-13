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
        <div id="video-placeholder"></div>
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
        background: url(../middle-info-background.png);
        background-size: cover;
    }
    #player-info-container {
        position: absolute;
        top: 100px;
        left: 45px;
    }
    .player-info {
        margin-bottom: 30px;
        width: 600px;
    }
    #discord-voice {
        position: absolute;
        top: 100px;
        left: 901px;
        width: 1000px;
    }
    #video-placeholder {
        position: absolute;
        left: 691px;
        top: 376px;
        width: 1198px;
        height: 674px;
        background-color: grey;
        filter: brightness(60%) blur(5px) opacity(75%);
    }
</style>
