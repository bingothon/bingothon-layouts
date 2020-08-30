<template>
	<div>
		<twitch-player id="stream1" streamIndex="0"></twitch-player>
		<twitch-player id="stream2" streamIndex="1"></twitch-player>
    <div id="fillvoice" class="flexContainer"></div>
    <player-info id="pi1" playerIndex="0" height=45px></player-info>
    <player-info id="pi2" playerIndex="1" height=45px></player-info>
	<div id="timer-and-discord-container">
		<test-timer-container id="timer"></test-timer-container>
		<discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="125px" maxUserCount="4"></discord-voice-display>
	</div>
	<test-game-container id="game"></test-game-container>
    <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
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
    top: 0px;
    left: 0px;
    width: 960px;
    height: 720px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }
  #stream2 {
    position: absolute;
    top: 0px;
    left: 960px;
    width: 960px;
    height: 720px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }
  #discord-voice {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 300px;
    height: 300px;
  }
  #pi1 {
    position: absolute;
    top: 720px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 715px;
  }
  #pi2 {
    position: absolute;
    top: 720px;
    left: 1190px;
    border: 2px var(--container-border-color) solid;
    width: 715px;
  }
  #Bingo-board {
    position: absolute;
    top: 720px;
    left: 730px;
    border: 2px var(--container-border-color) solid;
    width: 460px;
    height: 360px;
  }
  #game {
    background-image: url("../../../static/background-sunshine.jpg");
	background-size: cover;
	background-repeat: no-repeat;
    position: absolute;
    top: 780px;
    left: 0px;
    width: 730px;
    border: 2px var(--container-border-color) solid;
    height: 300px;
  }
  #timer{
    position: absolute;
    top: 0px;
    left: 300px;
    width: 440px;
    height: 300px;
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
