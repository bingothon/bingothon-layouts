<template>
    <div id="GameLayout">
        <twitch-player id="stream1" streamIndex="0"></twitch-player>
        <twitch-player id="stream2" streamIndex="1"></twitch-player>
        <twitch-player id="stream3" streamIndex="2"></twitch-player>
        <twitch-player id="stream4" streamIndex="3"></twitch-player>
        <div id="fillbar" class="flexContainer"></div>
        <div id="fillvoice" class="flexContainer"></div>
        <player-info id="pi1" playerIndex="0" height="45px"></player-info>
        <player-info id="pi2" playerIndex="1" height="45px"></player-info>
        <player-info id="pi3" playerIndex="2" height="45px"></player-info>
        <player-info id="pi4" playerIndex="3" height="45px"></player-info>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <div id="SponsorContainer">
            <rotating-logo logo-asset-type="wideLargeLogos"></rotating-logo>
        </div>
        <bingo-board id="Bingo-board" fontSize="20px"></bingo-board>
        <discord-voice-display
            id="discord-voice"
            iconHeight="40px"
            nameWidth="114px"
            maxUserCount="6"
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
    import TwitchPlayer from '../components/twitchStreamPlaceholder.vue';
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
        top: 60px;
        left: 0px;
        width: 782px;
        height: 440px;
        border: 2px var(--container-border-color) solid;
        background: linear-gradient(-128deg, #0e0e0e 0, #444444 100%) 100% no-repeat fixed;
    }

    #stream2 {
        position: absolute;
        top: 60px;
        left: 1138px;
        width: 782px;
        height: 440px;
        border: 2px var(--container-border-color) solid;
        background: linear-gradient(-128deg, #0e0e0e 0, #444444 100%) 100% no-repeat fixed;
    }

    #stream3 {
        position: absolute;
        top: 500px;
        left: 0px;
        width: 782px;
        height: 440px;
        border: 2px var(--container-border-color) solid;
        background: linear-gradient(-128deg, #0e0e0e 0, #444444 100%) 100% no-repeat fixed;
    }

    #stream4 {
        position: absolute;
        top: 500px;
        left: 1138px;
        width: 782px;
        height: 440px;
        border: 2px var(--container-border-color) solid;
        background: linear-gradient(-128deg, #0e0e0e 0, #444444 100%) 100% no-repeat fixed;
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
        top: 447px;
        left: 779px;
        width: 350px;
        height: 145px;
        border: 2px var(--container-border-color) solid;
        margin-left: 2px;
        padding: 3px 4px;
        background-color: rgba(30, 60, 80, 0.9);
        border: 1px solid rgba(10, 40, 60, 0.8); /* Dark bluish border */

        /* Darker ice-like gradient background using SVG */
        background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="darkIceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(40, 70, 90, 0.7); stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(10, 40, 60, 0.9); stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23darkIceGradient)" /></svg>');
        box-shadow: 0px 0px 5px 2px rgba(10, 40, 60, 0.3);
    }
    #SponsorContainer {
        position: absolute;
        top: 271px;
        left: 779px;
        width: 350px;
        height: 168px;
        border: 2px var(--container-border-color) solid;
        margin-left: 2px;
        padding: 3px 4px;
        background-color: rgba(30, 60, 80, 0.9);
        border: 1px solid rgba(10, 40, 60, 0.8); /* Dark bluish border */

        /* Darker ice-like gradient background using SVG */
        background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="darkIceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(40, 70, 90, 0.7); stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(10, 40, 60, 0.9); stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23darkIceGradient)" /></svg>');
        box-shadow: 0px 0px 5px 2px rgba(10, 40, 60, 0.3);
    }

    #pi1 {
        position: absolute;
        top: 0px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 769px;
        margin-left: -1px;
    }

    #pi2 {
        position: absolute;
        top: 0px;
        left: 1138px;
        border: 2px var(--container-border-color) solid;
        width: 769px;
    }

    #pi3 {
        position: absolute;
        top: 940px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 769px;
        margin-left: -1px;
    }

    #pi4 {
        position: absolute;
        top: 940px;
        left: 1138px;
        border: 2px var(--container-border-color) solid;
        width: 769px;
    }

    #Bingo-board {
        position: absolute;
        top: 600px;
        left: 782px;
        border: 2px var(--container-border-color) solid;
        width: 356px;
        height: 400px;
    }

    #game {
        /*background-image: url("../../../static/middle-info-background.png");*/
        position: absolute;
        top: 0px;
        left: 779px;
        width: 350px;
        height: 125px;
        margin-left: 2px;
        padding: 3px 4px;
        background-color: rgba(30, 60, 80, 0.9);
        border: 1px solid rgba(10, 40, 60, 0.8); /* Dark bluish border */

        /* Darker ice-like gradient background using SVG */
        background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="darkIceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(40, 70, 90, 0.7); stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(10, 40, 60, 0.9); stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23darkIceGradient)" /></svg>');
        box-shadow: 0px 0px 5px 2px rgba(10, 40, 60, 0.3);
    }

    #timer {
        position: absolute;
        top: 133px;
        left: 779px;
        width: 350px;
        height: 130px;
        margin-left: 2px;
        padding: 3px 4px;
        background-color: rgba(30, 60, 80, 0.9);
        border: 1px solid rgba(10, 40, 60, 0.8); /* Dark bluish border */

        /* Darker ice-like gradient background using SVG */
        background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="darkIceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(40, 70, 90, 0.7); stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(10, 40, 60, 0.9); stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23darkIceGradient)" /></svg>');
        box-shadow: 0px 0px 5px 2px rgba(10, 40, 60, 0.3);
    }
</style>
