<template>
    <div id="GameLayout">
        <twitch-player id="stream1" :streamIndex="0"></twitch-player>
        <twitch-player id="stream2" :streamIndex="1"></twitch-player>
        <twitch-player id="stream3" :streamIndex="2"></twitch-player>
        <twitch-player id="stream4" :streamIndex="3"></twitch-player>
        <div id="fillbar" class="flexContainer"></div>
        <player-info id="pi1" playerIndex="0" height="60px"></player-info>
        <player-info id="pi2" playerIndex="1" height="60px"></player-info>
        <player-info id="pi3" playerIndex="2" height="60px"></player-info>
        <player-info id="pi4" playerIndex="3" height="60px"></player-info>
        <discord-voice-display
            id="discord-voice-left"
            iconHeight="40px"
            nameWidth="114px"
            maxUserCount="3"
        ></discord-voice-display>
        <discord-voice-display
            id="discord-voice-right"
            iconHeight="40px"
            nameWidth="114px"
            starting-member="3"
            maxUserCount="3"
        ></discord-voice-display>
        <div id="SponsorContainer">
            <rotating-logo logo-asset-type="wideLargeLogos"></rotating-logo>
        </div>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <tracker id="tracker1" playerNumber="1"></tracker>
        <tracker id="tracker2" playerNumber="2"></tracker>
        <tracker id="tracker3" playerNumber="3"></tracker>
        <tracker id="tracker4" playerNumber="4"></tracker>
        <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
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
    import Tracker from '../components/tracker.vue'

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
            Tracker,
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
        width: 672px;
        height: 378px;
        border: 2px var(--container-border-color) solid;
        background-color: aqua;
        box-sizing: border-box;
    }

    #stream2 {
        position: absolute;
        top: 60px;
        left: 1248px;
        width: 672px;
        height: 378px;
        border: 2px var(--container-border-color) solid;
        background-color: blue;
        box-sizing: border-box;
    }

    #stream3 {
        position: absolute;
        top: 562px;
        left: 0px;
        width: 672px;
        height: 378px;
        border: 2px var(--container-border-color) solid;
        background-color: red;
        box-sizing: border-box;
    }

    #stream4 {
        position: absolute;
        top: 562px;
        left: 1248px;
        width: 672px;
        height: 378px;
        border: 2px var(--container-border-color) solid;
        background-color: orange;
        box-sizing: border-box;
    }

    #tracker1,
    #tracker2,
    #tracker3,
    #tracker4 {
        position: absolute;
        width: 165px;
        height: 438px;
        border: 2px var(--container-border-color) solid;
        box-sizing: border-box;
    }

    #tracker1 {
        left: 672px;
        top: 0px;
    }

    #tracker3 {
        left: 672px;
        top: 562px;
    }

    #tracker2 {
        left: 1083px;
        top: 0px;
    }

    #tracker4 {
        left: 1083px;
        top: 562px;
    }

    #fillbar {
        position: absolute;
        top: 1000px;
        left: 0px;
        width: 1920px;
        height: 80px;
        background-image: url('../../../static/middle-info-background.png');
        border: 2px var(--container-border-color) solid;
        box-sizing: border-box;
    }

    #discord-voice-left {
        position: absolute;
        top: 438px;
        left: 0px;
        width: 593px;
        height: 124px;
        border: 2px var(--container-border-color) solid;
        box-sizing: border-box;
    }

    #discord-voice-right {
        position: absolute;
        top: 438px;
        left: 1327px;
        width: 593px;
        height: 124px;
        border: 2px var(--container-border-color) solid;
        box-sizing: border-box;
    }

    #pi1 {
        position: absolute;
        top: 0px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 672px;
        box-sizing: border-box;
    }

    #pi2 {
        position: absolute;
        top: 0px;
        left: 1248px;
        border: 2px var(--container-border-color) solid;
        width: 672px;
        box-sizing: border-box;
    }

    #pi3 {
        position: absolute;
        top: 940px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 672px;
        box-sizing: border-box;
    }

    #pi4 {
        position: absolute;
        top: 940px;
        left: 1248px;
        border: 2px var(--container-border-color) solid;
        width: 672px;
        box-sizing: border-box;
    }

    #Bingo-board {
        position: absolute;
        top: 562px;
        left: 837px;
        border: 2px var(--container-border-color) solid;
        width: 246px;
        height: 438px;
        box-sizing: border-box;
    }

    #game {
        position: absolute;
        top: 0px;
        left: 837px;
        width: 246px;
        border: 2px var(--container-border-color) solid;
        height: 438px;
        box-sizing: border-box;
    }

    #timer {
        position: absolute;
        top: 438px;
        left: 593px;
        width: 367px;
        border: 2px var(--container-border-color) solid;
        height: 124px;
        box-sizing: border-box;
    }

    #SponsorContainer {
        position: absolute;
        top: 438px;
        left: 960px;
        width: 367px;
        height: 124px;
        border: 2px var(--container-border-color) solid;
        box-sizing: border-box;
    }
</style>
