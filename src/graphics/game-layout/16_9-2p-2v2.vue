<template>
    <div id="GameLayout">
        <!--   Stream for first player of each team     -->
        <twitch-player id="stream1" streamIndex="0"></twitch-player>
        <twitch-player id="stream3" streamIndex="2"></twitch-player>
        <div id="fillbar" class="flexContainer"></div>
        <div id="team1" :style="{ border: '5px var(--border-color-' + teamColor1 + ') solid' }">
            <team-info team-index="0" height="45px" id="ti1"></team-info>
            <player-info
                id="pi1"
                playerIndex="0"
                hide-finish-time="true"
                show-color="false"
                height="40px"
            ></player-info>
            <player-info
                id="pi2"
                playerIndex="1"
                hide-finish-time="true"
                show-color="false"
                height="40px"
            ></player-info>
        </div>
        <div id="team2" :style="{ border: '5px var(--border-color-' + teamColor2 + ') solid' }">
            <team-info team-index="1" height="45px" id="ti2"></team-info>
            <player-info
                id="pi3"
                playerIndex="2"
                hide-finish-time="true"
                show-color="false"
                height="40px"
            ></player-info>
            <player-info
                id="pi4"
                playerIndex="3"
                hide-finish-time="true"
                show-color="false"
                height="40px"
            ></player-info>
        </div>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
        <div id="SponsorContainer">
            <rotating-logo logo-asset-type="wideSmallLogos"></rotating-logo>
        </div>
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
            TwitchPlayer,
        },
    })
    export default class GameLayout extends Vue {
        get teams(): RunDataTeam[] {
            return store.state.runDataActiveRun.teams;
        }

        get teamColor1(): string {
            return store.state.bingoboardMeta.playerColors[0];
        }

        get teamColor2(): string {
            return store.state.bingoboardMeta.playerColors[2];
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
        left: 0px;
        width: 960px;
        height: 540px;
        border: 2px var(--container-border-color) solid;
        background-color: aqua;
    }

    #stream3 {
        position: absolute;
        top: 0px;
        left: 960px;
        width: 960px;
        height: 540px;
        border: 2px var(--container-border-color) solid;
        background-color: blue;
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
        top: 660px;
        left: 1280px;
        width: 250px;
        height: 340px;
        border: 2px var(--container-border-color) solid;
    }

    #team1 {
        position: absolute;
        left: 0px;
        width: 630px;
        top: 540px;
        height: 112px;
    }

    #ti1 {
        position: absolute;
        top: 0px;
        left: 0px;
        background-image: linear-gradient(var(--lighter-main-color), var(--darker-main-color));
        width: 617px;
    }

    #pi1 {
        position: absolute;
        top: 59px;
        left: 0px;
        width: 301px;
    }

    #pi2 {
        position: absolute;
        top: 59px;
        left: 315px;
        width: 302px;
    }

    #team2 {
        position: absolute;
        left: 1280px;
        width: 634px;
        top: 540px;
        height: 112px;
    }

    #ti2 {
        position: absolute;
        top: 0px;
        left: 0px;
        background-image: linear-gradient(var(--lighter-main-color), var(--darker-main-color));
        width: 622px;
    }

    #pi3 {
        position: absolute;
        top: 59px;
        left: 0px;
        width: 304px;
    }

    #pi4 {
        position: absolute;
        top: 59px;
        left: 318px;
        width: 304px;
    }

    #Bingo-board {
        position: absolute;
        top: 540px;
        left: 640px;
        border: 2px var(--container-border-color) solid;
        width: 638px;
        height: 460px;
    }

    #game {
        position: absolute;
        top: 850px;
        left: 0px;
        width: 640px;
        border: 2px var(--container-border-color) solid;
        height: 150px;
    }

    #timer {
        position: absolute;
        top: 660px;
        left: 1530px;
        width: 390px;
        border: 2px var(--container-border-color) solid;
        height: 340px;
    }

    #SponsorContainer {
        position: absolute;
        top: 660px;
        left: 0px;
        width: 638px;
        border: 2px var(--container-border-color) solid;
        height: 190px;
    }
</style>
