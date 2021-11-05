<template>
    <div>
        <twitch-player id="stream1" streamIndex="0"></twitch-player>
        <twitch-player id="stream2" streamIndex="1"></twitch-player>
        <div id="fillbar" class="flexContainer"></div>
        <div id="fillvoice" class="flexContainer"></div>
        <player-info id="pi1" playerIndex="0" height=45px></player-info>
        <player-info id="pi2" playerIndex="1" height=45px></player-info>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
        <div id="SponsorContainer">
            <rotating-logo logo-asset-type="squareLogos"></rotating-logo>
        </div>
        <discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="125px"
                               maxUserCount="4"></discord-voice-display>
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
import TwitchPlayer from "../components/twitchStreamPlaceholder.vue";
import RotatingLogo from "../components/rotatingLogo.vue";
import {RunDataPlayer, RunDataTeam} from "../../../speedcontrol-types";

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
        RotatingLogo
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
    top: 0px;
    left: 0px;
    width: 960px;
    height: 720px;
    border: 2px var(--container-border-color) solid;
    background-color: aqua;
}

#stream2 {
    position: absolute;
    top: 0px;
    left: 960px;
    width: 960px;
    height: 720px;
    border: 2px var(--container-border-color) solid;
    background-color: blue;
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
    top: 780px;
    left: 1280px;
    width: 250px;
    height: 220px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
}

#pi1 {
    position: absolute;
    top: 720px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 625px;
}

#pi2 {
    position: absolute;
    top: 720px;
    left: 1280px;
    border: 2px var(--container-border-color) solid;
    width: 625px;
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
    background-image: url("../../../static/middle-info-background.png");
    position: absolute;
    top: 780px;
    left: 0px;
    width: 320px;
    border: 2px var(--container-border-color) solid;
    height: 220px;
}

#SponsorContainer {
    background-image: url("../../../static/middle-info-background.png");
    position: absolute;
    top: 780px;
    left: 320px;
    width: 320px;
    border: 2px var(--container-border-color) solid;
    height: 220px;
}

#timer {
    position: absolute;
    top: 780px;
    left: 1530px;
    background-image: url("../../../static/middle-info-background.png");
    width: 390px;
    border: 2px var(--container-border-color) solid;
    height: 220px;
}
</style>
