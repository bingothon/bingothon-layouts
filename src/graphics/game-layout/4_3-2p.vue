<template>
    <div id="GameLayout">
        <twitch-player id="stream1" streamIndex="0"></twitch-player>
        <twitch-player id="stream2" streamIndex="1"></twitch-player>
        <div id="fillbar" class="flexContainer"></div>
        <div id="fillvoice" class="flexContainer"></div>
        <player-info id="pi1" playerIndex="0" height="60px"></player-info>
        <player-info id="pi2" playerIndex="1" height="60px"></player-info>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
        <div id="SponsorContainer">
            <rotating-logo logo-asset-type="squareLogos"></rotating-logo>
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
    import { store } from '../../browser-util/state';
    import TestTimerContainer from '../components/timerContainer.vue';
    import TestGameContainer from '../components/gameContainer.vue';
    import BingoBoard from '../components/bingoboard.vue';
    import PlayerInfo from '../components/playerInfo.vue';
    import TeamInfo from '../components/teamInfo.vue';
    import PlayerTeamContainer from '../components/playerTeamContainer.vue';
    import DiscordVoiceDisplay from '../components/discordVoiceDisplay.vue';
    import TwitchPlayer from '../components/twitchStreamPlaceholder.vue';
    import RotatingLogo from '../components/sponsorLogoRotation.vue';
    import { RunDataTeam } from '../../../speedcontrol-types';

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
        width: 820px;
        height: 615px;
        border: 2px var(--container-border-color) solid;
        background-color: aqua;
    }

    #stream2 {
        position: absolute;
        top: 0px;
        left: 1100px;
        width: 820px;
        height: 615px;
        border: 2px var(--container-border-color) solid;
        background-color: blue;
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
        left: 820px;
        width: 280px;
        height: 335px;
        border: 2px var(--container-border-color) solid;
    }

    #pi1 {
        position: absolute;
        top: 615px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 643px;
        box-sizing: border-box;
    }

    #pi2 {
        position: absolute;
        top: 615px;
        left: 1280px;
        border: 2px var(--container-border-color) solid;
        width: 643px;
        box-sizing: border-box;
    }

    #Bingo-board {
        position: absolute;
        top: 615px;
        left: 640px;
        border: 2px var(--container-border-color) solid;
        width: 640px;
        height: 385px;
    }

    #game {
        position: absolute;
        top: 675px;
        left: 0px;
        width: 643px;
        border: 2px var(--container-border-color) solid;
        height: 325px;
    }

    #SponsorContainer {
        position: absolute;
        top: 335px;
        left: 820px;
        width: 280px;
        border: 2px var(--container-border-color) solid;
        height: 280px;
    }

    #timer {
        position: absolute;
        top: 675px;
        left: 1280px;
        width: 643px;
        border: 2px var(--container-border-color) solid;
        height: 325px;
    }
</style>
