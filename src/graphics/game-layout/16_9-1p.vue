<template>
    <div id="GameLayout">
        <!-- <div id="fillur" class="flexContainer"></div> -->
        <div id="fillbar" class="flexContainer"></div>
        <player-info id="pi1" playerIndex="0" height="60px" hideSoundIcon="true"></player-info>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
        <discord-voice-display
            id="discord-voice"
            iconHeight="40px"
            nameWidth="114px"
            maxUserCount="8"
        ></discord-voice-display>
        <div id="SponsorContainer">
            <rotating-logo logo-asset-type="wideLargeLogos"></rotating-logo>
        </div>
        <twitch-player id="stream1" streamIndex="0"></twitch-player>
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

    #fillur {
        position: absolute;
        top: 0px;
        left: 400px;
        width: 1520px;
        height: 855px;
        border: 2px var(--container-border-color) solid;
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
        top: 560px;
        left: 0px;
        width: 448px;
        height: 265px;
        /*background-image: url("../../../static/middle-info-background.png");*/
        border: 2px var(--container-border-color) solid;
    }

    #pi1 {
        position: absolute;
        top: 0px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 448px;
        box-sizing: border-box;
    }

    #Bingo-board {
        position: absolute;
        top: 60px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 448px;
        height: 500px;
    }

    #game {
        /*background-image: url("../../../static/middle-info-background.png");*/
        position: absolute;
        top: 828px;
        left: 448px;
        width: 750px;
        border: 2px var(--container-border-color) solid;
        height: 172px;
    }

    #timer {
        position: absolute;
        top: 828px;
        left: 1198px;
        /*background-image: url("../../../static/middle-info-background.png");*/
        width: 720px;
        border: 2px var(--container-border-color) solid;
        height: 172px;
    }

    #stream1 {
        position: absolute;
        top: 0px;
        left: 450px;
        width: 1471px;
        height: 828px;
        background-color: aqua;
    }

    #SponsorContainer {
        /*background-image: url("../../../static/middle-info-background.png");*/
        position: absolute;
        top: 828px;
        left: 0px;
        width: 448px;
        border: 2px var(--container-border-color) solid;
        height: 172px;
    }
</style>
