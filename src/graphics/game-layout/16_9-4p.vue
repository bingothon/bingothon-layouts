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
            TwitchPlayer,
        },
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
        left: 782px;
        width: 356px;
        height: 150px;
        border: 2px var(--container-border-color) solid;
        background-image: url('data:image/svg+xml;utf8,<svg width="356" height="150" xmlns="http://www.w3.org/2000/svg"><polygon points="24,145 12,125 0,145" fill="rgba(0,128,0,0.4)" /><rect x="10" y="145" width="4" height="5" fill="rgba(139,69,19,0.8)" /><polygon points="72,145 60,125 48,145" fill="rgba(0,128,0,0.4)" /><rect x="58" y="145" width="4" height="5" fill="rgba(139,69,19,0.8)" /><polygon points="124,142 118,127 112,142" fill="rgba(0,128,0,0.4)" /><rect x="116" y="142" width="4" height="8" fill="rgba(139,69,19,0.8)" /><polygon points="244,145 232,125 220,145" fill="rgba(0,128,0,0.4)" /><rect x="230" y="145" width="4" height="5" fill="rgba(139,69,19,0.8)" /><polygon points="324,140 312,115 300,140" fill="rgba(0,128,0,0.4)" /><rect x="310" y="138" width="4" height="12" fill="rgba(139,69,19,0.8)" /><circle cx="15" cy="125" r="1.5" fill="white"/><circle cx="27" cy="127" r="1" fill="white"/><circle cx="60" cy="125" r="1.5" fill="white"/><circle cx="84" cy="127" r="1" fill="white"/><circle cx="114" cy="127" r="1.5" fill="white"/><circle cx="134" cy="125" r="1" fill="white"/><circle cx="220" cy="125" r="1.5" fill="white"/><circle cx="258" cy="127" r="1" fill="white"/><circle cx="312" cy="117" r="1.5" fill="white"/><circle cx="338" cy="115" r="1" fill="white"/></svg>');
        background-repeat: no-repeat;
    }

    #SponsorContainer {
        position: absolute;
        top: 257px;
        left: 782px;
        width: 356px;
        height: 188px;
        border: 2px var(--container-border-color) solid;
        background-image: url('data:image/svg+xml;utf8,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="2" fill="white"/><circle cx="25" cy="25" r="1" fill="white"/><circle cx="75" cy="75" r="1" fill="white"/></svg>');
        background-repeat: repeat;
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
        left: 782px;
        width: 356px;
        border: 2px var(--container-border-color) solid;
        height: 125px;
        background-image: url('data:image/svg+xml;utf8,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="2" fill="white"/><circle cx="25" cy="25" r="1" fill="white"/><circle cx="75" cy="75" r="1" fill="white"/></svg>');
        background-repeat: repeat;
    }

    #timer {
        position: absolute;
        top: 125px;
        left: 782px;
        /*background-image: url("../../../static/middle-info-background.png");*/
        width: 356px;
        border: 2px var(--container-border-color) solid;
        height: 130px;
        background-image: url('data:image/svg+xml;utf8,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="2" fill="white"/><circle cx="25" cy="25" r="1" fill="white"/><circle cx="75" cy="75" r="1" fill="white"/></svg>');
        background-repeat: repeat;
    }
</style>
