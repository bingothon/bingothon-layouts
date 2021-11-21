<template>
    <div>
        <twitch-player id="stream1" :streamIndex="0"></twitch-player>
        <twitch-player id="stream2" :streamIndex="1"></twitch-player>
        <twitch-player id="stream3" :streamIndex="2"></twitch-player>
        <div id="fillbar" class="flexContainer"></div>
        <player-info id="pi1" playerIndex="0" height=45px></player-info>
        <player-info id="pi2" playerIndex="1" height=45px></player-info>
        <player-info id="pi3" playerIndex="2" height=45px></player-info>
        <discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="114px"
        maxUserCount="10"></discord-voice-display>
        <div id="SponsorContainer">
            <rotating-logo logo-asset-type="wideLargeLogos"></rotating-logo>
        </div>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <tracker id="tracker1" playerNumber="1"></tracker>
        <tracker id="tracker2" playerNumber="2"></tracker>
        <tracker id="tracker3" playerNumber="3"></tracker>
        <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
    </div>
</template>

<script lang="ts">
import {Component, Vue, Watch, Prop} from "vue-property-decorator";
import {nodecg, NodeCG} from "../../browser-util/nodecg";
import {Bingoboard, BingosyncSocket, BingoboardMeta} from "../../../schemas";
import {store, getReplicant} from "../../browser-util/state";
import TestTimerContainer from "../components/timerContainer.vue";
import TestGameContainer from "../components/gameContainer.vue";
import BingoBoard from "../components/bingoboard.vue";
import PlayerInfo from "../components/playerInfo.vue";
import TeamInfo from "../components/teamInfo.vue";
import PlayerTeamContainer from "../components/playerTeamContainer.vue";
import DiscordVoiceDisplay from "../components/discordVoiceDisplay.vue";
import {RunDataPlayer, RunDataTeam} from "../../../speedcontrol-types";
import TwitchPlayer from "../components/twitchStreamPlaceholder.vue";
import RotatingLogo from "../components/rotatingLogo.vue";
import Tracker from "../components/tracker.vue";

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
    }
})

export default class GameLayout extends Vue {
    get teams(): RunDataTeam[] {
        return store.state.runDataActiveRun.teams;
    }
}
</script>

<style scoped>
#stream1 {
    position: absolute;
    top: 60px;
    left: 0px;
    width: 694px;
    height: 390px;
    border: 2px var(--container-border-color) solid;
    background-color: aqua;
}

#stream2 {
    position: absolute;
    top: 60px;
    left: 1225px;
    width: 694px;
    height: 390px;
    border: 2px var(--container-border-color) solid;
    background-color: blue;
}

#stream3 {
    position: absolute;
    top: 550px;
    left: 0px;
    width: 694px;
    height: 390px;
    border: 2px var(--container-border-color) solid;
    background-color: red;
}

#tracker1, #tracker2, #tracker3 {
    position: absolute;
    width: 160px;
    height: 447px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
}

#tracker1 {
    left: 697px;
    top: 0px;
}

#tracker3 {
    left: 697px;
    top: 552px;
}

#tracker2 {
    left: 1061px;
    top: 0px;
}

#fillbar {
    position: absolute;
    top: 1000px;
    left: 0px;
    width: 1920px;
    height: 80px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
}

#discord-voice {
    position: absolute;
    top: 450px;
    left: 0px;
    width: 1920px;
    height: 100px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
}

#pi1 {
    position: absolute;
    top: 0px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 680px;
}

#pi2 {
    position: absolute;
    top: 0px;
    left: 1225px;
    border: 2px var(--container-border-color) solid;
    width: 680px;
}

#pi3 {
    position: absolute;
    top: 940px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 680px;
}

#Bingo-board {
    position: absolute;
    top: 552px;
    left: 1225px;
    border: 2px var(--container-border-color) solid;
    width: 694px;
    height: 447px;
}

#game {
    background-image: url("../../../static/middle-info-background.png");
    position: absolute;
    top: 0px;
    left: 860px;
    width: 198px;
    border: 2px var(--container-border-color) solid;
    height: 447px;
}

#timer {
    position: absolute;
    top: 749px;
    left: 860px;
    background-image: url("../../../static/middle-info-background.png");
    width: 363px;
    border: 2px var(--container-border-color) solid;
    height: 250px;
}

#SponsorContainer {
    position: absolute;
    top: 553px;
    left: 860px;
    width: 363px;
    height: 196px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
}
</style>
