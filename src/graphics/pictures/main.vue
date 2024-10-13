<template>
    <div id="discussion">
        <div id="background"></div>
        <div id="picture0" class="picture-placeholder"></div>
        <score-player-info id="info0" class="player-info" height="50px" :playerIndex="0"></score-player-info>
        <div id="picture1" class="picture-placeholder"></div>
        <score-player-info id="info1" class="player-info" height="50px" :playerIndex="1"></score-player-info>
        <div id="picture2" class="picture-placeholder"></div>
        <score-player-info id="info2" class="player-info" height="50px" :playerIndex="2"></score-player-info>
        <div id="picture3" class="picture-placeholder"></div>
        <score-player-info id="info3" class="player-info" height="50px" :playerIndex="3"></score-player-info>
        <div id="picture4" class="picture-placeholder"></div>
        <score-player-info id="info4" class="player-info" height="50px" :playerIndex="4"></score-player-info>
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
    .picture-placeholder {
        position: absolute;
        width: 600px;
        height: 338px;
        background: grey;
        filter: brightness(60%) blur(5px) opacity(75%);
    }
    #picture0 {
        left: 20px;
        top: 20px;
    }
    .player-info {
        position: absolute;
        width: 500px;
    }
    #info0 {
        top: 400px;
        left: 70px;
    }
    #picture1 {
        left: 660px;
        top: 20px;
    }
    #info1 {
        top: 400px;
        left: 710px;
    }
    #picture2 {
        left: 1300px;
        top: 20px;
    }
    #info2 {
        top: 400px;
        left: 1350px;
    }
    #picture3 {
        left: 240px;
        top: 520px;
    }
    #info3 {
        top: 900px;
        left: 280px;
    }
    #picture4 {
        left: 1080px;
        top: 520px;
    }
    #info4 {
        top: 900px;
        left: 1125px;
    }
    #discord-voice {
        position: absolute;
        top: 983px;
        left: 174px;
        width: 1558px;
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
