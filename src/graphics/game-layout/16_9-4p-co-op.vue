<template>
    <div id="GameLayout">
        <twitch-player
            id="stream1"
            streamIndex="0"
            :style="{ border: '2px var(--border-color-' + teamColor1 + ') solid' }"
        ></twitch-player>
        <twitch-player
            id="stream2"
            streamIndex="1"
            :style="{ border: '2px var(--border-color-' + teamColor1 + ') solid' }"
        ></twitch-player>
        <twitch-player
            id="stream3"
            streamIndex="2"
            :style="{ border: '2px var(--border-color-' + teamColor2 + ') solid' }"
        ></twitch-player>
        <twitch-player
            id="stream4"
            streamIndex="3"
            :style="{ border: '2px var(--border-color-' + teamColor2 + ') solid' }"
        ></twitch-player>
        <div id="fillbar" class="flexContainer"></div>
        <div id="fillvoice" class="flexContainer"></div>
        <team-info
            team-index="0"
            height="45px"
            id="ti1"
            :style="{ border: '5px var(--border-color-' + teamColor1 + ') solid' }"
        ></team-info>
        <player-info
            id="pi1"
            playerIndex="0"
            height="45px"
            hide-finish-time="true"
            show-color="false"
            :style="{ border: '5px var(--border-color-' + teamColor1 + ') solid' }"
        ></player-info>
        <player-info
            id="pi2"
            playerIndex="1"
            height="45px"
            hide-finish-time="true"
            show-color="false"
            :style="{ border: '5px var(--border-color-' + teamColor1 + ') solid' }"
        ></player-info>
        <team-info
            team-index="1"
            height="45px"
            id="ti2"
            :style="{ border: '5px var(--border-color-' + teamColor2 + ') solid' }"
        ></team-info>
        <player-info
            id="pi3"
            playerIndex="2"
            height="45px"
            hide-finish-time="true"
            show-color="false"
            :style="{ border: '5px var(--border-color-' + teamColor2 + ') solid' }"
        ></player-info>
        <player-info
            id="pi4"
            playerIndex="3"
            height="45px"
            hide-finish-time="true"
            show-color="false"
            :style="{ border: '5px var(--border-color-' + teamColor2 + ') solid' }"
        ></player-info>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <div id="SponsorContainer">
            <rotating-logo logo-asset-type="squareLogos"></rotating-logo>
        </div>
        <bingo-board id="Bingo-board" fontSize="20px"></bingo-board>
        <discord-voice-display
            id="discord-voice"
            iconHeight="40px"
            nameWidth="114px"
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
        top: 69px;
        left: 0px;
        width: 697px;
        height: 393px;
        background-color: aqua;
    }

    #stream2 {
        position: absolute;
        top: 535px;
        left: 0px;
        width: 697px;
        height: 392px;
        background-color: blue;
    }

    #stream3 {
        position: absolute;
        top: 69px;
        left: 1224px;
        width: 697px;
        height: 393px;
        background-color: red;
    }

    #stream4 {
        position: absolute;
        top: 535px;
        left: 1224px;
        width: 697px;
        height: 392px;
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
        top: 276px;
        left: 961px;
        width: 259px;
        height: 222px;
        border: 2px var(--container-border-color) solid;
    }

    #pi1 {
        position: absolute;
        top: 0px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 677px;
    }

    #pi2 {
        position: absolute;
        top: 931px;
        left: 0px;
        border: 2px var(--container-border-color) solid;
        width: 677px;
    }

    #pi3 {
        position: absolute;
        top: 0px;
        left: 1224px;
        border: 2px var(--container-border-color) solid;
        width: 677px;
    }

    #pi4 {
        position: absolute;
        top: 931px;
        left: 1224px;
        border: 2px var(--container-border-color) solid;
        width: 677px;
    }

    #ti1 {
        position: absolute;
        top: 466px;
        left: 0px;
        width: 677px;
        background-image: linear-gradient(#6d001d, #280000);
        border: 2px var(--container-border-color) solid;
    }

    #ti2 {
        position: absolute;
        top: 466px;
        left: 1224px;
        width: 677px;
        background-image: linear-gradient(#6d001d, #280000);
        border: 2px var(--container-border-color) solid;
    }

    #Bingo-board {
        position: absolute;
        top: 500px;
        left: 701px;
        border: 2px var(--container-border-color) solid;
        width: 519px;
        height: 496px;
    }

    #game {
        position: absolute;
        top: 0px;
        left: 701px;
        width: 519px;
        border: 2px var(--container-border-color) solid;
        height: 115px;
    }

    #timer {
        position: absolute;
        top: 118px;
        left: 701px;
        width: 519px;
        border: 2px var(--container-border-color) solid;
        height: 155px;
    }

    #SponsorContainer {
        position: absolute;
        top: 276px;
        left: 701px;
        width: 257px;
        height: 221px;
        border: 2px var(--container-border-color) solid;
    }
</style>
