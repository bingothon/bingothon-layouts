<template>
    <div id="GameLayout">
        <twitch-player id="stream1" streamIndex="0"></twitch-player>
        <twitch-player id="stream2" streamIndex="1"></twitch-player>
        <twitch-player id="stream3" streamIndex="2"></twitch-player>
        <div id="fillbar" class="flexContainer"></div>
        <div id="fillvoice" class="flexContainer"></div>
        <player-info id="pi1" playerIndex="0" height="60px"></player-info>
        <player-info id="pi2" playerIndex="1" height="60px"></player-info>
        <player-info id="pi3" playerIndex="2" height="60px"></player-info>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
        <div id="SponsorContainer">
            <rotating-logo logo-asset-type="wideLargeLogos"></rotating-logo>
        </div>
        <discord-voice-display
            id="discord-voice"
            iconHeight="40px"
            nameWidth="125px"
            maxUserCount="12"
        ></discord-voice-display>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { store } from '../../browser-util/state';
    import TestTimerContainer from '../components/timerContainer.vue';
    import TestGameContainer from '../components/gameContainer.vue';
    import BingoBoard from '../components/bingoboard.vue';
    import PlayerInfo from '../components/playerInfo.vue';
    import TeamInfo from '../components/teamInfo.vue';
    import PlayerTeamContainer from '../components/playerTeamContainer.vue';
    import DiscordVoiceDisplay from '../components/discordVoiceDisplay.vue';
    import { RunDataTeam } from '../../../speedcontrol-types';
    import RotatingLogo from '../components/sponsorLogoRotation.vue';
    import TwitchPlayer from '../components/twitchStreamPlaceholder.vue';

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
            RotatingLogo
        }
    })
    export default class GameLayout extends Vue {
        get teams(): RunDataTeam[] {
            return store.state.runDataActiveRun.teams;
        }
    }
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
        top: 0px;
        left: 0px;
        width: 640px;
        height: 480px;
        border: 2px var(--container-border-color) solid;
        background-color: aqua;
    }

    #stream2 {
        position: absolute;
        top: 0px;
        left: 640px;
        width: 640px;
        height: 480px;
        border: 2px var(--container-border-color) solid;
        background-color: blue;
    }

    #stream3 {
        position: absolute;
        top: 0px;
        left: 1280px;
        width: 640px;
        height: 480px;
        border: 2px var(--container-border-color) solid;
        background-color: red;
    }

    #fillbar {
        position: absolute;
        top: 1000px;
        left: 0px;
        width: 1920px;
        height: 80px;
        border: 2px var(--container-border-color) solid;
    }

    #discord-voice {
        position: absolute;
        top: 540px;
        left: 1280px;
        width: 640px;
        height: 200px;
        border: 2px var(--container-border-color) solid;
    }

    #SponsorContainer {
        position: absolute;
        top: 540px;
        left: 0px;
        width: 640px;
        height: 200px;
        border: 2px var(--container-border-color) solid;
    }

    #pi1 {
        position: absolute;
        top: 480px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 640px;
        height: 60px;
    }

    #pi2 {
        position: absolute;
        top: 480px;
        left: 640px;
        border: 2px var(--container-border-color) solid;
        width: 640px;
    }

    #pi3 {
        position: absolute;
        top: 480px;
        left: 1280px;
        border: 2px var(--container-border-color) solid;
        width: 640px;
    }

    #Bingo-board {
        position: absolute;
        top: 540px;
        left: 640px;
        border: 2px var(--container-border-color) solid;
        width: 640px;
        height: 460px;
    }

    #game {
        position: absolute;
        top: 740px;
        left: 0px;
        width: 640px;
        border: 2px var(--container-border-color) solid;
        height: 260px;
    }

    #timer {
        position: absolute;
        top: 740px;
        left: 1280px;
        width: 640px;
        border: 2px var(--container-border-color) solid;
        height: 260px;
    }
</style>
