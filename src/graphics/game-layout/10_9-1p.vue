<template>
    <div id="GameLayout">
        <twitch-player id="stream1" streamIndex="0"></twitch-player>
        <div id="fillbar" class="flexContainer"></div>
        <div id="fillvoice" class="flexContainer"></div>
        <player-info id="pi1" playerIndex="0" height=60px hideSoundIcon="true"></player-info>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
        <div id="SponsorContainer">
            <rotating-logo logo-asset-type="wideSmallLogos"></rotating-logo>
        </div>
        <discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="125px"
                               maxUserCount="8"></discord-voice-display>
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
import {RunDataPlayer, RunDataTeam} from "../../../speedcontrol-types";
import RotatingLogo from "../components/sponsorLogoRotation.vue";

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
    }
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
    top: 0px;
    left: 809px;
    width: 1111px;
    height: 1000px;
    border: 2px var(--container-border-color) solid;
    background-color: aqua;
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

#SponsorContainer {
    position: absolute;
    top: 410px;
    left: 0px;
    width: 810px;
    height: 150px;
    border: 2px var(--container-border-color) solid;
    box-sizing: border-box;
}

#pi1 {
    position: absolute;
    top: 0px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 810px;
    box-sizing: border-box;
}

#Bingo-board {
    position: absolute;
    top: 560px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 810px;
    height: 440px;
    box-sizing: border-box;
}

#game {
    position: absolute;
    top: 60px;
    left: 0px;
    width: 810px;
    border: 2px var(--container-border-color) solid;
    height: 150px;
    box-sizing: border-box;
}

#timer {
    position: absolute;
    top: 210px;
    left: 0px;
    width: 400px;
    border: 2px var(--container-border-color) solid;
    height: 200px;
    box-sizing: border-box;
}

#discord-voice {
    position: absolute;
    top: 210px;
    left: 400px;
    width: 410px;
    border: 2px var(--container-border-color) solid;
    height: 200px;
    box-sizing: border-box;
}

#player0 {
    position: absolute;
    top: 0px;
    left: 589px;
    width: 1332px;
    height: 1000px;
}
</style>
