<template>
    <div id="GameLayout">
        <twitch-player id="stream1" streamIndex="0"></twitch-player>
        <twitch-player id="stream2" streamIndex="1"></twitch-player>
        <twitch-player id="stream3" streamIndex="2"></twitch-player>
        <twitch-player id="stream4" streamIndex="3"></twitch-player>
        <twitch-player id="stream5" streamIndex="4"></twitch-player>
        <twitch-player id="stream6" streamIndex="5"></twitch-player>
        <div id="fillvoice" class="flexContainer"></div>
        <timer-container id="timer"></timer-container>
        <discord-voice-display id="discord-voice" iconHeight="40px" maxUserCount="5"
                               nameWidth="125px"
        ></discord-voice-display>
        <game-container id="game"></game-container>
        <div id="SponsorContainer">
            <rotating-logo logo-asset-type="squareLogos"></rotating-logo>
        </div>
        <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
        <player-info id="pi1" :hide-finish-time="true" :show-color="!coop" height=45px
                     playerIndex="0"></player-info>
        <player-info id="pi2" :hide-finish-time="true" :show-color="!coop" height=45px
                     playerIndex="1"></player-info>
        <player-info id="pi3" :hide-finish-time="true" :show-color="!coop" height=45px
                     playerIndex="2"></player-info>
        <player-info id="pi4" :hide-finish-time="true" :show-color="!coop" height=45px playerIndex="3"
                     reverse-order></player-info>
        <player-info id="pi5" :hide-finish-time="true" :show-color="!coop" height=45px playerIndex="4"
                     reverse-order></player-info>
        <player-info id="pi6" :hide-finish-time="true" :show-color="!coop" height=45px playerIndex="5"
                     reverse-order></player-info>
    </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {store} from "../../browser-util/state";
import TimerContainer from "../components/timerContainer.vue";
import GameContainer from "../components/gameContainer.vue";
import BingoBoard from "../components/bingoboard.vue";
import PlayerInfo from "../components/playerInfo.vue";
import TeamInfo from "../components/teamInfo.vue";
import PlayerTeamContainer from "../components/playerTeamContainer.vue";
import DiscordVoiceDisplay from "../components/discordVoiceDisplay.vue";
import TwitchPlayer from "../components/twitchStreamPlaceholder.vue";
import {RunDataTeam} from "../../../speedcontrol-types";
import RotatingLogo from "../components/sponsorLogoRotation.vue";

@Component({
    components: {
        BingoBoard,
        GameContainer,
        PlayerInfo,
        TeamInfo,
        PlayerTeamContainer,
        TimerContainer,
        DiscordVoiceDisplay,
        TwitchPlayer,
        RotatingLogo
    }
})

export default class GameLayout extends Vue {
    get teams(): RunDataTeam[] {
        return store.state.runDataActiveRun.teams;
    }

    get coop(): boolean {
        return store.state.runDataActiveRun.teams[0].players.length === 3;
    }
}
</script>

<style scoped>

#stream1 {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 592px;
    height: 333px;
    border: 2px var(--container-border-color) solid;
}

#stream3 {
    position: absolute;
    top: 333px;
    left: 0px;
    width: 592px;
    height: 333px;
    border: 2px var(--container-border-color) solid;
}

#stream5 {
    position: absolute;
    top: 666px;
    left: 0px;
    width: 592px;
    height: 333px;
    border: 2px var(--container-border-color) solid;
}

#stream2 {
    position: absolute;
    top: 0px;
    left: 1328px;
    width: 592px;
    height: 333px;
    border: 2px var(--container-border-color) solid;
}

#stream4 {
    position: absolute;
    top: 333px;
    left: 1328px;
    width: 592px;
    height: 333px;
    border: 2px var(--container-border-color) solid;
}

#stream6 {
    position: absolute;
    top: 666px;
    left: 1328px;
    width: 592px;
    height: 333px;
    border: 2px var(--container-border-color) solid;
}

#discord-voice {
    position: absolute;
    top: 335px;
    left: 595px;
    width: 362px;
    height: 228px;
    border: 2px var(--container-border-color) solid;
}

#pi1 {
    position: absolute;
    top: 290px;
    left: 594px;
    border: 2px var(--container-border-color) solid;
    width: 367px;
    box-sizing: border-box;
}

#pi3 {
    position: absolute;
    top: 562px;
    left: 594px;
    border: 2px var(--container-border-color) solid;
    width: 367px;
    box-sizing: border-box;
}

#pi5 {
    position: absolute;
    top: 955px;
    left: 594px;
    border: 2px var(--container-border-color) solid;
    width: 367px;
    box-sizing: border-box;
}

#pi2 {
    position: absolute;
    top: 290px;
    left: 960px;
    border: 2px var(--container-border-color) solid;
    width: 369px;
    box-sizing: border-box;
}

#pi4 {
    position: absolute;
    top: 562px;
    left: 960px;
    border: 2px var(--container-border-color) solid;
    width: 369px;
    box-sizing: border-box;
}

#pi6 {
    position: absolute;
    top: 955px;
    left: 960px;
    border: 2px var(--container-border-color) solid;
    width: 369px;
    box-sizing: border-box;
}

#Bingo-board {
    position: absolute;
    top: 605px;
    left: 595px;
    width: 730px;
    border: 2px var(--container-border-color) solid;
    height: 355px;
}

#game {
    position: absolute;
    top: 0px;
    left: 595px;
    width: 730px;
    border: 2px var(--container-border-color) solid;
    height: 160px;
}

#timer {
    position: absolute;
    top: 163px;
    left: 595px;
    width: 730px;
    height: 123px;
    border: 2px var(--container-border-color) solid;
}

#SponsorContainer {
    position: absolute;
    top: 335px;
    left: 960px;
    width: 365px;
    height: 228px;
    border: 2px var(--container-border-color) solid;
}

#GameLayout {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 1920px;
    height: 1080px;
    /* background: linear-gradient(-128deg, #627fbe 0, #050a1b 100%) 100% no-repeat fixed */
    background: linear-gradient(-128deg, var(--darker-main-color) 0, var(--lighter-main-color) 100%) 100% no-repeat fixed;
}

#fillbar {
    position: absolute;
    top: 1000px;
    left: 0px;
    width: 1920px;
    height: 80px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
    box-sizing: border-box;
}
</style>
