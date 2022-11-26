<template>
	<div id="GameLayout">
		<div id="fillleft" class="flexContainer"></div>
		<div id="fillright" class="flexContainer"></div>
			<twitch-player id="stream1" streamIndex="0"></twitch-player>
			<twitch-player id="stream2" streamIndex="1"></twitch-player>
			<twitch-player id="stream3" streamIndex="2"></twitch-player>
			<twitch-player id="stream4" streamIndex="3"></twitch-player>
		<div id="fillbar" class="flexContainer"></div>
		<div id="fillvoice" class="flexContainer"></div>
			<player-info id="pi1" playerIndex="0" height=45px></player-info>
			<player-info id="pi2" playerIndex="1" height=45px></player-info>
			<player-info id="pi3" playerIndex="2" height=45px></player-info>
			<player-info id="pi4" playerIndex="3" height=45px></player-info>
			<test-game-container id="game"></test-game-container>
		<test-timer-container id="timer"></test-timer-container>
		<bingo-board id="Bingo-board" fontSize="30px"></bingo-board>

		<discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="125px" maxUserCount="9"></discord-voice-display>
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
  import TwitchPlayer from "../components/twitchStreamPlaceholder.vue";
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
    left: 0px;
    width: 555px;
    height: 500px;
    border: 2px var(--container-border-color) solid;
  }
  #stream2 {
    position: absolute;
    top: 0px;
    left: 1365px;
    width: 555px;
    height: 499px;
    border: 2px var(--container-border-color) solid;
  }
  #stream3 {
    position: absolute;
    top: 500px;
    left: 0px;
    width: 555px;
    height: 500px;
    border: 2px var(--container-border-color) solid;
  }
  #stream4 {
    position: absolute;
    top: 500px;
    left: 1365px;
    width: 555px;
    height: 499px;
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
	top: 62px;
	left: 1056px;
	width: 309px;
	height: 438px;
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
  #PlayerContainer1, #PlayerContainer3 {
    margin-right: 88px;
  }
  #PlayerContainer2, #PlayerContainer4 {
    margin-top: 3px;
    margin-left: 88px;
  }
  #InfoStorageBox2 {
    position: absolute;
    left: 626px;
    top: 633px;
    width: 668px;
    height: 307px;
  }
  #pi1 {
    position: absolute;
    top: 0px;
    left: 555px;
    border: 2px var(--container-border-color) solid;
    width: 389px;
  }

  #pi2 {
	  position: absolute;
	  top: 0px;
	  left: 960px;
	  border: 2px var(--container-border-color) solid;
	  width: 389px;
  }
  #pi3 {
    position: absolute;
    top: 938px;
    left: 555px;
    border: 2px var(--container-border-color) solid;
    width: 389px;
  }

  #pi4 {
	  position: absolute;
	  top: 938px;
	  left: 960px;
	  border: 2px var(--container-border-color) solid;
	  width: 389px;
  }
  #Bingo-board {
    position: absolute;
    top: 502px;
    left: 555px;
    border: 2px var(--container-border-color) solid;
    width:810px;
    height:434px;
  }
  #game {
    background-image: url("../../../static/middle-info-background.png");
    position: absolute;
    top: 62px;
    left: 555px;
    width: 501px;
    border: 2px var(--container-border-color) solid;
    height: 228px;
  }
  #timer{
    position: absolute;
    top: 293px;
    left: 555px;
    background-image: url("../../../static/middle-info-background.png");
    width: 501px;
    border: 2px var(--container-border-color) solid;
    height: 207px;
  }
  #fillupperplayers, #filllowerplayers {
	  background-image: linear-gradient(var(--alternative-main-color), var(--darker-main-color));
	  left: 672px;
	  height: 130px;
	  width: 581px;
	  position: absolute;
  }

  #fillupperplayers {
	  top: 0px;
  }
  #filllowerplayers {
	  top: 870px;
  }

</style>
