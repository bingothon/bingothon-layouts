<template>

	<div>
		<twitch-player id="stream1" streamIndex="0"></twitch-player>
		<twitch-player id="stream2" streamIndex="1"></twitch-player>
    <div id="fillvoice" class="flexContainer"></div>
    <player-info id="pi1" playerIndex="0" height=45px></player-info>
    <player-info id="pi2" playerIndex="1" height=45px></player-info>
	<test-timer-container id="timer"></test-timer-container>
	<discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="125px" maxUserCount="6"></discord-voice-display>
	<div id="game"	class="flexContainer">
	  <test-game-container id="gamec"></test-game-container>
      <img src="../../../static/Super_Mario_Sunshine_logo.png" id="logo">
	</div>
    <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
	<div id="bingo-bottom-border" class="FlexContainer"></div>
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
  import TwitchPlayer from "../components/twitchPlayer.vue";
  import { RunDataPlayer, RunDataTeam } from "../../../speedcontrol-types";

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
    width: 480px;
    height: 360px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }
  #stream2 {
    position: absolute;
    top: 660px;
    left: 0px;
    width: 480px;
    height: 360px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }
  #discord-voice {
    position: absolute;
    top: 660px;
    left: 480px;
    width: 360px;
    height: 420px;
	background-image: url("../../../static/background-sunshine.jpg");
	background-size: cover;
	background-repeat: no-repeat;
	border: 2px var(--container-border-color) solid;
  }
  #pi1 {
    position: absolute;
    top: 0px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 467px;
  }
  #pi2 {
    position: absolute;
    top: 1020px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 467px;
  }
  #Bingo-board {
    position: absolute;
    top: 0px;
    left: 843px;
    width: 1073px;
    height: 1076px;
	border: 2px var(--container-border-color) solid;
	border-bottom: 2px var(--container-border-color) solid;;
  }
  #bingo-bottom-border {
	  position: absolute;
	  left: 845px;
	  top: 1078px;
	  width: 1080px;
	  height: 2px;
	  background: white;
  }
  #game {
    background-image: url("../../../static/background-sunshine.jpg");
	background-size: cover;
	background-repeat: no-repeat;
    position: absolute;
    top: 0px;
    left: 480px;
    width: 360px;
    border: 2px var(--container-border-color) solid;
    height: 420px;
  }
  #gamec{
	  position: absolute;
	  left: 0px;
	  width: 360px;
	  top: 250px;
  }
  #logo {
	  position: absolute;
	  height: 150px;
	  top: 75px;
	  left: 65px;
  }
  #timer{
    position: absolute;
    top: 420px;
    left: 0px;
    width: 840px;
    height: 240px;
	background-image: url("../../../static/background-sunshine.jpg");
	background-size: cover;
	background-repeat: no-repeat;
	border: 2px var(--container-border-color) solid;
  }
  #timer-and-discord-container {
	  position: absolute;
	  left: 1190px;
	  top: 780px;
	  width: 730px;
	  height: 300px;
	  border: 2px var(--container-border-color) solid;
	  background-image: url("../../../static/background-sunshine.jpg");
	  background-size: cover;
	  background-repeat: no-repeat;
  }
</style>
