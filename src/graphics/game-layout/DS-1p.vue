<template>
    <div id="GameLayout">
        <div id="background"></div>
        <div id="ds-top"></div>
        <div id="ds-bottom"></div>
        <twitch-player id="stream1" streamIndex="0"></twitch-player>
        <!-- <div id="fillbar" class="flexContainer"></div> -->
        <sponsor-logo-rotation logo-asset-type="squareLogos" id="SponsorContainer"></sponsor-logo-rotation>
        <player-info id="pi1" playerIndex="0" height="60px"></player-info>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
        <discord-voice-display
            id="discord-voice"
            iconHeight="40px"
            nameWidth="125px"
            maxUserCount="3"
        ></discord-voice-display>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import TestTimerContainer from '../components/timerContainer.vue';
    import TestGameContainer from '../components/gameContainer.vue';
    import BingoBoard from '../components/bingoboard.vue';
    import PlayerInfo from '../components/playerInfo.vue';
    import TeamInfo from '../components/teamInfo.vue';
    import PlayerTeamContainer from '../components/playerTeamContainer.vue';
    import DiscordVoiceDisplay from '../components/discordVoiceDisplay.vue';
    import TwitchPlayer from '../components/twitchStreamPlaceholder.vue';
    import RotatingLogos from '../omnibar/components/RotatingLogos.vue';
    import SponsorLogoRotation from '../components/sponsorLogoRotation.vue';

    @Component({
        components: {
            SponsorLogoRotation,
            RotatingLogos,
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
    export default class GameLayout extends Vue {}
</script>

<style scoped>
    #GameLayout {
        position: absolute;
        left: 0;
        top: 0;
    }
    #background {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 1920px;
        height: 1080px;
        background: linear-gradient(-128deg, var(--gradient-light) 0, var(--gradient-dark) 100%) 100% no-repeat fixed;
        clip-path: polygon(0px 840px, 1118px 840px, 1118px 659px, 1920px 659px, 1920px 1080px, 0 1080px);
    }

    /* taking a different appraoch here, laying streams under the rest of the layout: Topscreen aaspect ratio 800x600
ouchscreen aspect ratio: 533x400*/
    #stream1 {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 1920px;
        height: 839px;
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
        top: 840px;
        left: 866px;
        width: 250px;
        height: 156px;
        border: 2px var(--container-border-color) solid;
    }

    .PlayerContainer {
        width: 580px;
    }

    .PlayerContainer >>> .PlayerInfoBox {
        height: 40px;
        font-size: 25px;
    }

    #pi1 {
        position: absolute;
        top: 601px;
        left: 1118px;
        border: 2px var(--container-border-color) solid;
        width: 802px;
        box-sizing: border-box;
    }

    #Bingo-board {
        position: absolute;
        top: 660px;
        left: 1422px;
        border: 2px var(--container-border-color) solid;
        width: 496px;
        height: 336px;
    }

    #game {
        position: absolute;
        top: 840px;
        left: 0px;
        width: 504px;
        height: 156px;
        border: 2px var(--container-border-color) solid;
    }

    #timer {
        position: absolute;
        top: 840px;
        left: 505px;
        width: 360px;
        border: 2px var(--container-border-color) solid;
        height: 156px;
    }

    #SponsorContainer {
        position: absolute;
        top: 659px;
        left: 1118px;
        width: 302px;
        height: 337px;
        border: 2px var(--container-border-color) solid;
    }

    #ds-top {
        position: absolute;
        width: 1116px;
        height: 838px;
        border: 2px var(--container-border-color) solid;
    }

    #ds-bottom {
        position: absolute;
        left: 1118px;
        width: 798px;
        height: 599px;
        border: 2px var(--container-border-color) solid;
    }
</style>
