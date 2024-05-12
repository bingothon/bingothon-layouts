<template>
    <div id="GameLayout">
        <twitch-player id="stream1" streamIndex="0"></twitch-player>
        <div id="fillbar" class="flexContainer"></div>
        <div id="fillvoice" class="flexContainer"></div>
        <player-info id="pi1" playerIndex="0" height="60px" hideSoundIcon="true"></player-info>
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
            maxUserCount="4"
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
    import TwitchPlayer from '../components/twitchStreamPlaceholder.vue';
    import { RunDataTeam } from '../../../speedcontrol-types';
    import RotatingLogo from '../components/sponsorLogoRotation.vue';

    @Component({
        components: {
            RotatingLogo,
            BingoBoard,
            TestGameContainer,
            PlayerInfo,
            TeamInfo,
            PlayerTeamContainer,
            TestTimerContainer,
            DiscordVoiceDisplay,
            TwitchPlayer
        }
    })
    export default class GameLayout extends Vue {
        get teams(): RunDataTeam[] {
            return store.state.runDataActiveRun.teams;
        }
    }
</script>

<style scoped>
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
        left: 587px;
        width: 1333px;
        height: 1000px;
        border: 2px var(--container-border-color) solid;
        background-color: aqua;
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

    #SponsorContainer {
        position: absolute;
        top: 460px;
        left: 0px;
        width: 586px;
        height: 150px;
        border: 2px var(--container-border-color) solid;
    }

    #pi1 {
        position: absolute;
        top: 0px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 588px;
        box-sizing: border-box;
    }

    #Bingo-board {
        position: absolute;
        top: 610px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 587px;
        height: 390px;
    }

    #game {
        position: absolute;
        top: 60px;
        left: 0px;
        width: 586px;
        border: 2px var(--container-border-color) solid;
        height: 180px;
    }

    #timer {
        position: absolute;
        top: 240px;
        left: 0px;
        width: 325px;
        border: 2px var(--container-border-color) solid;
        height: 220px;
    }

    #discord-voice {
        position: absolute;
        top: 240px;
        left: 325px;
        width: 261px;
        border: 2px var(--container-border-color) solid;
        height: 220px;
    }

    #player0 {
        position: absolute;
        top: 0px;
        left: 589px;
        width: 1332px;
        height: 1000px;
    }
</style>
