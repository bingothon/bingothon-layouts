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
    import { Component, Vue } from 'vue-property-decorator'
    import { store } from '../../browser-util/state'
    import TestTimerContainer from '../components/timerContainer.vue'
    import TestGameContainer from '../components/gameContainer.vue'
    import BingoBoard from '../components/bingoboard.vue'
    import PlayerInfo from '../components/playerInfo.vue'
    import TeamInfo from '../components/teamInfo.vue'
    import PlayerTeamContainer from '../components/playerTeamContainer.vue'
    import DiscordVoiceDisplay from '../components/discordVoiceDisplay.vue'
    import { RunDataTeam } from '../../../speedcontrol-types'
    import TwitchPlayer from '../components/twitchStreamPlaceholder.vue'
    import RotatingLogo from '../components/sponsorLogoRotation.vue'

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
            TwitchPlayer,
        },
    })
    export default class GameLayout extends Vue {
        get teams(): RunDataTeam[] {
            return store.state.runDataActiveRun.teams
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
        background-color: aqua;
    }

    #stream2 {
        position: absolute;
        top: 60px;
        left: 1138px;
        width: 782px;
        height: 440px;
        border: 2px var(--container-border-color) solid;
        background-color: blue;
    }

    #stream3 {
        position: absolute;
        top: 500px;
        left: 0px;
        width: 782px;
        height: 440px;
        border: 2px var(--container-border-color) solid;
        background-color: red;
    }

    #stream4 {
        position: absolute;
        top: 500px;
        left: 1138px;
        width: 782px;
        height: 440px;
        border: 2px var(--container-border-color) solid;
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
        top: 447px;
        left: 782px;
        width: 356px;
        height: 150px;
        /*background-image: url("../../../static/middle-info-background.png");*/
        border: 2px var(--container-border-color) solid;
    }

    #SponsorContainer {
        position: absolute;
        top: 257px;
        left: 782px;
        width: 356px;
        height: 188px;
        /*background-image: url("../../../static/middle-info-background.png");*/
        border: 2px var(--container-border-color) solid;
    }

    #pi1 {
        position: absolute;
        top: 0px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 769px;
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
        left: 782px;
        width: 356px;
        border: 2px var(--container-border-color) solid;
        height: 125px;
    }

    #timer {
        position: absolute;
        top: 125px;
        left: 782px;
        /*background-image: url("../../../static/middle-info-background.png");*/
        width: 356px;
        border: 2px var(--container-border-color) solid;
        height: 130px;
    }
</style>
