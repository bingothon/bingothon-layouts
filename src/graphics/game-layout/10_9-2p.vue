<template>
    <div id="GameLayout">
        <twitch-player id="stream1" streamIndex="0"></twitch-player>
        <twitch-player id="stream2" streamIndex="1"></twitch-player>
        <div id="fillbar" class="flexContainer"></div>
        <div id="fillright" class="flexContainer"></div>
        <div id="fillleft" class="flexContainer"></div>
        <div id="fillvoice" class="flexContainer"></div>
        <player-info id="pi1" playerIndex="0" height="60px"></player-info>
        <player-info id="pi2" playerIndex="1" height="60px"></player-info>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
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

    @Component({
        components: {
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
        left: 160px;
        width: 800px;
        height: 720px;
        border: 2px var(--container-border-color) solid;
    }

    #stream2 {
        position: absolute;
        top: 0px;
        left: 960px;
        width: 800px;
        height: 720px;
        border: 2px var(--container-border-color) solid;
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
        top: 780px;
        left: 1280px;
        width: 250px;
        height: 220px;
        border: 2px var(--container-border-color) solid;
    }

    #fillleft {
        position: absolute;
        width: 160px;
        height: 720px;
        border: 2px var(--container-border-color) solid;
        left: 0px;
        top: 0px;
    }

    #fillright {
        position: absolute;
        width: 160px;
        height: 720px;
        border: 2px var(--container-border-color) solid;
        left: 1760px;
        top: 0px;
    }

    #pi1 {
        position: absolute;
        top: 720px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 640px;
    }

    #pi2 {
        position: absolute;
        top: 720px;
        left: 1280px;
        border: 2px var(--container-border-color) solid;
        width: 640px;
    }

    #Bingo-board {
        position: absolute;
        top: 720px;
        left: 640px;
        border: 2px var(--container-border-color) solid;
        width: 640px;
        height: 280px;
    }

    #game {
        position: absolute;
        top: 780px;
        left: 0px;
        width: 640px;
        border: 2px var(--container-border-color) solid;
        height: 220px;
    }

    #timer {
        position: absolute;
        top: 780px;
        left: 1530px;
        width: 390px;
        border: 2px var(--container-border-color) solid;
        height: 220px;
    }
</style>
