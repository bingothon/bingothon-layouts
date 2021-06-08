<template>
    <div>
        <div id="fillMiddle"></div>
        <div id="fillbar" class="flexContainer"></div>
        <twitch-player id="stream1" streamIndex="0"
                       :style="{'border': '2px var(--border-color-' + teamColor1 + ') solid'}"></twitch-player>
        <twitch-player id="stream2" streamIndex="1"
                       :style="{'border': '2px var(--border-color-' + teamColor1 + ') solid'}"></twitch-player>
        <twitch-player id="stream3" streamIndex="2"
                       :style="{'border': '2px var(--border-color-' + teamColor2 + ') solid'}"></twitch-player>
        <twitch-player id="stream4" streamIndex="3"
                       :style="{'border': '2px var(--border-color-' + teamColor2 + ') solid'}"></twitch-player>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
        <discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="125px"
        maxUserCount="6"></discord-voice-display>
        <team-info
            id="ptc1"
            teamIndex="0"
            height="40px"
            :style="{'border': '5px var(--border-color-' + teamColor1 + ') solid'}"
        ></team-info>
        <player-info
            playerIndex="0"
            hide-finish-time
            id="pi1"
            show-color="false"
            class="PlayerInfo"
            :style="{'border': '5px var(--border-color-' + teamColor1 + ') solid'}"
        ></player-info>
        <player-info
            playerIndex="1"
            hide-finish-time
            id="pi2"
            class="PlayerInfo"
            show-color="false"
            :style="{'border': '5px var(--border-color-' + teamColor1 + ') solid'}"
        ></player-info>
        <team-info
            id="ptc2"
            teamIndex="1"
            height="40px"
            :style="{'border': '5px var(--border-color-' + teamColor2 + ') solid'}"
        ></team-info>
        <player-info
            playerIndex="2"
            hide-finish-time
            id="pi3"
            show-color="false"
            class="PlayerInfo"
            :style="{'border': '5px var(--border-color-' + teamColor2 + ') solid'}"
        ></player-info>
        <player-info
            playerIndex="3"
            hide-finish-time
            id="pi4"
            class="PlayerInfo"
            show-color="false"
            :style="{'border': '5px var(--border-color-' + teamColor2 + ') solid'}"
        ></player-info>
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

    get teamColor1(): string {
        return store.state.bingoboardMeta.playerColors[0];
    }

    get teamColor2(): string {
        return store.state.bingoboardMeta.playerColors[2];
    }

}
</script>

<style scoped>
#stream1 {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 631px;
    height: 473px;
}

#stream2 {
    position: absolute;
    top: 527px;
    left: 0px;
    width: 631px;
    height: 469px;
}

#stream3 {
    position: absolute;
    top: 0px;
    left: 1289px;
    width: 627px;
    height: 473px;
}

#stream4 {
    position: absolute;
    top: 527px;
    left: 1289px;
    width: 627px;
    height: 469px;
}

#discord-voice {
    position: absolute;
    top: 158px;
    left: 1053px;
    width: 232px;
    height: 302px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
}

.PlayerContainer >>> .PlayerInfoBox {
    height: 40px;
    font-size: 25px;
}

#ptc1 {
    position: absolute;
    top: 473px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 611px;
    background-image: linear-gradient(var(--lighter-main-color), var(--darker-main-color));
}

#ptc2 {
    position: absolute;
    top: 473px;
    left: 1289px;
    border: 2px var(--container-border-color) solid;
    width: 607px;
    background-image: linear-gradient(var(--lighter-main-color), var(--darker-main-color));
}

#pi1 {
    left: 635px;
    top: 0px;
}

#pi2 {
    top: 842px;
    left: 635px;
}

#pi3 {
    left: 765px;
    top: 79px;
}

#pi4 {
    left: 765px;
    top: 921px;
}

.PlayerInfo {
    position: absolute;
    width: 500px;
}

#Bingo-board {
    position: absolute;
    top: 462px;
    left: 635px;
    width: 654px;
    height: 378px;
}

#game {
    background-image: url("../../../static/middle-info-background.png");
    position: absolute;
    top: 158px;
    left: 635px;
    width: 416px;
    border: 2px var(--container-border-color) solid;
    height: 155px;
}

#fillMiddle {
    position: absolute;
    top: 0px;
    left: 633px;
    height: 1000px;
    width: 656px;
    background-image: url("../../../static/middle-info-background.png");
}

#timer {
    position: absolute;
    top: 315px;
    left: 635px;
    background-image: url("../../../static/middle-info-background.png");
    width: 416px;
    border: 2px var(--container-border-color) solid;
    height: 145px;
}

#fillbar {
    position: absolute;
    top: 1000px;
    left: 0px;
    width: 1920px;
    height: 80px;
    background-image: url("../../../static/middle-info-background.png");
}
</style>
