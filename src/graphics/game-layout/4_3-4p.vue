<template>
    <div id="GameLayout">
        <twitch-player id="stream1" streamIndex="0"></twitch-player>
        <twitch-player id="stream2" streamIndex="1"></twitch-player>
        <twitch-player id="stream3" streamIndex="2"></twitch-player>
        <twitch-player id="stream4" streamIndex="3"></twitch-player>
        <div id="fillbar" class="flexContainer"></div>
        <div id="fillvoice" class="flexContainer"></div>
        <player-info id="pi1" playerIndex="0" height="60px"></player-info>
        <player-info id="pi2" playerIndex="1" height="60px"></player-info>
        <player-info id="pi3" playerIndex="2" height="60px"></player-info>
        <player-info id="pi4" playerIndex="3" height="60px"></player-info>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
        <div id="SponsorContainer">
            <rotating-logo logo-asset-type="wideSmallLogos"></rotating-logo>
        </div>
        <discord-voice-display
            id="discord-voice"
            iconHeight="40px"
            nameWidth="125px"
            maxUserCount="6"
        ></discord-voice-display>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import TestTimerContainer from '../components/timerContainer.vue';
    import TestGameContainer from '../components/gameContainer.vue';
    import BingoBoard from '../components/bingoboard.vue';
    import PlayerInfo from '../components/playerInfo.vue';
    import TeamInfo from '../components/teamInfo.vue';
    import PlayerTeamContainer from '../components/playerTeamContainer.vue';
    import DiscordVoiceDisplay from '../components/discordVoiceDisplay.vue';
    import TwitchPlayer from '../components/twitchStreamPlaceholder.vue';
    import RotatingLogo from '../components/sponsorLogoRotation.vue';

    @Component({
        components: {
            BingoBoard,
            TestGameContainer,
            PlayerInfo,
            TeamInfo,
            PlayerTeamContainer,
            TestTimerContainer,
            DiscordVoiceDisplay,
            TwitchPlayer,
            RotatingLogo,
        },
    })
    export default class GameLayout extends Vue {}
</script>

<style scoped>
    * {
        box-sizing: border-box;
    }

    #GameLayout {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 1920px;
        height: 1080px;
        background: linear-gradient(-128deg, var(--gradient-light) 0, var(--gradient-dark) 100%) 100% no-repeat fixed;
    }

    #stream1 {
        position: absolute;
        top: 60px;
        left: 0px;
        width: 587px;
        height: 440px;
        background-color: aqua;
    }

    #stream3 {
        position: absolute;
        top: 60px;
        left: 1333px;
        width: 587px;
        height: 440px;
        background-color: red;
    }

    #stream2 {
        position: absolute;
        top: 500px;
        left: 0px;
        width: 587px;
        height: 440px;
        background-color: blue;
    }

    #stream4 {
        position: absolute;
        top: 500px;
        left: 1333px;
        width: 587px;
        height: 440px;
        background-color: orange;
    }

    #fillbar {
        position: absolute;
        top: 1000px;
        left: 0px;
        width: 1920px;
        height: 80px;
        background-image: url('../../../static/middle-info-background.png');
        border: 2px var(--container-border-color) solid;
    }

    #discord-voice {
        position: absolute;
        top: 0px;
        left: 973px;
        width: 360px;
        height: 333px;
        border: 2px var(--container-border-color) solid;
    }

    #pi1 {
        position: absolute;
        top: 0px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 587px;
        box-sizing: border-box;
    }

    #pi3 {
        position: absolute;
        top: 0px;
        left: 1333px;
        border: 2px var(--container-border-color) solid;
        width: 587px;
        box-sizing: border-box;
    }

    #pi2 {
        position: absolute;
        top: 940px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 587px;
        box-sizing: border-box;
    }

    #pi4 {
        position: absolute;
        top: 940px;
        left: 1333px;
        border: 2px var(--container-border-color) solid;
        width: 587px;
        box-sizing: border-box;
    }

    #Bingo-board {
        position: absolute;
        top: 500px;
        left: 587px;
        border: 2px var(--container-border-color) solid;
        width: 746px;
        height: 500px;
    }

    #game {
        position: absolute;
        top: 0px;
        left: 586px;
        width: 388px;
        border: 2px var(--container-border-color) solid;
        height: 168px;
    }

    #timer {
        position: absolute;
        top: 168px;
        left: 586px;
        width: 388px;
        border: 2px var(--container-border-color) solid;
        height: 165px;
    }

    #fillupperplayers,
    #filllowerplayers {
        background-image: linear-gradient(var(--lighter-main-color), var(--darker-main-color));
        left: 671px;
        height: 130px;
        width: 582px;
        position: absolute;
    }

    #SponsorContainer {
        position: absolute;
        top: 333px;
        left: 586px;
        width: 746px;
        height: 168px;
        border: 2px var(--container-border-color) solid;
    }
</style>
