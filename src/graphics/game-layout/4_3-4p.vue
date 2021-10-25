<template>
    <div>
        <twitch-player id="stream1" streamIndex="0"></twitch-player>
        <twitch-player id="stream2" streamIndex="1"></twitch-player>
        <twitch-player id="stream3" streamIndex="2"></twitch-player>
        <twitch-player id="stream4" streamIndex="3"></twitch-player>
        <div id="fillbar" class="flexContainer"></div>
        <div id="fillvoice" class="flexContainer"></div>
        <div id="fillupperplayers"></div>
        <player-info id="pi1" playerIndex="0" height=45px></player-info>
        <player-info id="pi2" playerIndex="1" height=45px></player-info>
        <div id="filllowerplayers"></div>
        <player-info id="pi3" playerIndex="2" height=45px></player-info>
        <player-info id="pi4" playerIndex="3" height=45px></player-info>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
        <div id="SponsorContainer">
            <img src="../../../static/logo-winter.png" style="height: 100%; width: 100%; object-fit: contain">
        </div>
        <discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="125px"
                               maxUserCount="6"></discord-voice-display>
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
    }
})

export default class GameLayout extends Vue {

}
</script>

<style scoped>
#stream1 {
    position: absolute;
    top: 60px;
    left: 0px;
    width: 587px;
    height: 440px;
    background-color: aqua;
}

#stream3 {
    position: absolute;
    top: 60px;
    left: 1337px;
    width: 587px;
    height: 440px;
    background-color: red;
}

#stream2 {
    position: absolute;
    top: 500px;
    left: 0px;
    width: 587px;
    height: 440px;
    background-color: blue;
}

#stream4 {
    position: absolute;
    top: 500px;
    left: 1337px;
    width: 587px;
    height: 440px;
    background-color: orange;
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
    top: 0px;
    left: 975px;
    width: 359px;
    height: 333px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
}

#InfoStorageBox1 {
    position: absolute;
    left: 626px;
    top: 0px;
    width: 668px;
    height: 308px;
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
    top: 0px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 570px;
}

#pi3 {
    position: absolute;
    top: 0px;
    left: 1337px;
    border: 2px var(--container-border-color) solid;
    width: 570px;
}

#pi2 {
    position: absolute;
    top: 940px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 570px;
}

#pi4 {
    position: absolute;
    top: 938px;
    left: 1337px;
    border: 2px var(--container-border-color) solid;
    width: 570px;
}

#Bingo-board {
    position: absolute;
    top: 500px;
    left: 586px;
    border: 2px var(--container-border-color) solid;
    width: 747px;
    height: 500px;
}

#game {
    background-image: url("../../../static/middle-info-background.png");
    position: absolute;
    top: 0px;
    left: 586px;
    width: 386px;
    border: 2px var(--container-border-color) solid;
    height: 165px;
}

#timer {
    position: absolute;
    top: 168px;
    left: 586px;
    background-image: url("../../../static/middle-info-background.png");
    width: 386px;
    border: 2px var(--container-border-color) solid;
    height: 165px;
}

#fillupperplayers, #filllowerplayers {
    background-image: linear-gradient(var(--lighter-main-color), var(--darker-main-color));
    left: 671px;
    height: 130px;
    width: 582px;
    position: absolute;
}

#SponsorContainer {
    position: absolute;
    top: 336px;
    left: 586px;
    width: 748px;
    height: 163px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
}

</style>
