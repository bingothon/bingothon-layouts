<template>
	<div>
		<twitch-player id="stream1" streamIndex="0"></twitch-player>
		<twitch-player id="stream2" streamIndex="1"></twitch-player>
		<twitch-player id="stream3" streamIndex="2"></twitch-player>
		<twitch-player id="stream4" streamIndex="3"></twitch-player>
    <div id="fillbar" class="flexContainer"></div>
    <div id="fillvoice" class="flexContainer"></div>
    <player-info id="pi1" playerIndex="0" height=45px hide-finish-time="true" show-color="false"></player-info>
    <player-info id="pi2" playerIndex="1" height=45px hide-finish-time="true" show-color="false"></player-info>
    <player-info id="pi3" playerIndex="2" height=45px hide-finish-time="true" show-color="false"></player-info>
    <player-info id="pi4" playerIndex="3" height=45px hide-finish-time="true" show-color="false"></player-info>
		<test-game-container id="game"></test-game-container>
		<div id="ti1">
			<team-info team-index="0" height="45px"></team-info>
		</div>
		<div id="ti2">
			<team-info team-index="1" height="45px"></team-info>
		</div>
    <test-timer-container id="timer"></test-timer-container>
    <bingo-board id="Bingo-board" fontSize="20px"></bingo-board>
    <discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="114px" maxUserCount="4"></discord-voice-display>
	</div>
</template>

<script lang="ts">
	import { Component, Vue, Watch, Prop } from "vue-property-decorator";
	import { nodecg, NodeCG } from "../../browser-util/nodecg";
	import { Bingoboard, BingosyncSocket, BingoboardMeta } from "../../../schemas";
	import { store, getReplicant } from "../../browser-util/state";
  import TestTimerContainer from "../components/timerContainer.vue";
	import TestGameContainer from "../components/gameContainer.vue";
  import BingoBoard from "../components/bingoboard.vue";
  import PlayerInfo from "../components/playerInfo.vue";
  import TeamInfo from "../components/teamInfo.vue";
  import PlayerTeamContainer from "../components/playerTeamContainer.vue";
  import DiscordVoiceDisplay from "../components/discordVoiceDisplay.vue";
  import { RunDataPlayer, RunDataTeam } from "../../../speedcontrol-types";
  import TwitchPlayer from "../components/twitchStreamPlaceholder.vue";

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
    width: 782px;
    height: 440px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }
  #stream2 {
    position: absolute;
    top: 60px;
    left: 1138px;
    width: 782px;
    height: 440px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }
  #stream3 {
    position: absolute;
    top: 500px;
    left: 0px;
    width: 782px;
    height: 440px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }
  #stream4 {
    position: absolute;
    top: 500px;
    left: 1138px;
    width: 782px;
    height: 440px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
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
    top: 370px;
    left: 782px;
    width: 356px;
    height: 130px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }
  #pi1 {
    position: absolute;
    top: 0px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 718px;
  }
  #pi2 {
    position: absolute;
    top: 0px;
    left: 1188px;
    border: 2px var(--container-border-color) solid;
    width: 718px;
  }
  #pi3 {
    position: absolute;
    top: 940px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 718px;
  }
  #pi4 {
    position: absolute;
    top: 940px;
    left: 1188px;
    border: 2px var(--container-border-color) solid;
    width: 718px;
  }
	#ti1 {
		position: absolute;
		top: 0px;
		left: 732px;
		width: 456px;
		height: 59px;
		background-image: linear-gradient(var(--lighter-main-color), var(--darker-main-color));
		border: 2px var(--container-border-color) solid;
	}
	#ti2 {
		position: absolute;
		top: 940px;
		left: 732px;
		width: 456px;
		height: 59px;
		background-image: linear-gradient(var(--lighter-main-color), var(--darker-main-color));
		border: 2px var(--container-border-color) solid;
	}
  #Bingo-board {
    position: absolute;
    top: 500px;
    left: 782px;
    border: 2px var(--container-border-color) solid;
    width:356px;
    height:438px;
  }
  #game {
    background-image: url("../../../static/middle-info-background.png");
    position: absolute;
    top: 60px;
    left: 782px;
    width: 356px;
    border: 2px var(--container-border-color) solid;
    height: 155px;
  }
  #timer{
    position: absolute;
    top: 215px;
    left: 782px;
    background-image: url("../../../static/middle-info-background.png");
    width: 356px;
    border: 2px var(--container-border-color) solid;
    height: 155px;
  }
</style>
