<template>
    <div id="GameLayout">
        <twitch-player id="stream1" streamIndex="0"></twitch-player>
        <twitch-player id="stream2" streamIndex="1"></twitch-player>
        <div id="fillbar" class="flexContainer"></div>
        <sponsor-logo-rotation logo-asset-type="wideSmallLogos" id="SponsorContainer"></sponsor-logo-rotation>
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
        top: 0px;
        left: 0px;
        width: 1920px;
        height: 1080px;
        background: linear-gradient(-128deg, var(--gradient-light) 0, var(--gradient-dark) 100%) 100% no-repeat fixed;
    }

    /* taking a different appraoch here, laying streams under the rest of the layout: Topscreen aaspect ratio 800x600
ouchscreen aspect ratio: 533x400*/
    #stream1 {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 800px;
        height: 1080px;
        border: 2px var(--container-border-color) solid;
        z-index: 0;
    }

    #stream2 {
        position: absolute;
        top: 0px;
        left: 1120px;
        width: 800px;
        height: 1080px;
        border: 2px var(--container-border-color) solid;
        z-index: 0;
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
        top: 400px;
        left: 800px;
        width: 320px;
        height: 198px;
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
        top: 600px;
        left: 533px;
        border: 2px var(--container-border-color) solid;
        width: 428px;
        box-sizing: border-box;
    }

    #pi2 {
        position: absolute;
        top: 600px;
        left: 960px;
        border: 2px var(--container-border-color) solid;
        width: 428px;
        box-sizing: border-box;
    }

    #Bingo-board {
        position: absolute;
        top: 660px;
        left: 533px;
        border: 2px var(--container-border-color) solid;
        width: 851px;
        height: 340px;
    }

    #game {
        position: absolute;
        top: 0px;
        left: 800px;
        width: 320px;
        border: 2px var(--container-border-color) solid;
        height: 150px;
    }

    #timer {
        position: absolute;
        top: 150px;
        left: 800px;
        width: 320px;
        border: 2px var(--container-border-color) solid;
        height: 150px;
    }

    #SponsorContainer {
        position: absolute;
        top: 300px;
        left: 800px;
        width: 320px;
        height: 100px;
        border: 2px var(--container-border-color) solid;
    }
</style>
