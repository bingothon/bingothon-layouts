<template>
	<div>
    <div id="fillleft" class="flexContainer">
        <twitch-player id="stream1" streamIndex="0"></twitch-player>
        <twitch-player id="stream2" streamIndex="1"></twitch-player>
    </div>
    <div id="fillright" class="flexContainer">
		<twitch-player id="stream3" streamIndex="2"></twitch-player>
		<twitch-player id="stream4" streamIndex="3"></twitch-player>
    </div>
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

    <discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="125px" maxUserCount="6"></discord-voice-display>
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
  #stream1 {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 667px;
    height: 500px;
    border: 2px var(--container-border-color) solid;
  }
  #stream3 {
    position: absolute;
    top: 0px;
    left: 1253px;
    width: 667px;
    height: 499px;
    border: 2px var(--container-border-color) solid;
  }
  #stream2 {
    position: absolute;
    top: 500px;
    left: 0px;
    width: 667px;
    height: 500px;
    border: 2px var(--container-border-color) solid;
  }
  #stream4 {
    position: absolute;
    top: 500px;
    left: 1253px;
    width: 667px;
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
	top: 125px;
	left: 1056px;
	width: 194px;
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
    left: 670px;
    border: 2px var(--container-border-color) solid;
    width: 530px;
  }

  #pi3 {
	  position: absolute;
	  top: 63px;
	  left: 705px;
	  border: 2px var(--container-border-color) solid;
	  width: 530px;
  }
  #pi2 {
    position: absolute;
    top: 875px;
    left: 670px;
    border: 2px var(--container-border-color) solid;
    width: 530px;
  }

  #pi4 {
	  position: absolute;
	  top: 938px;
	  left: 705px;
	  border: 2px var(--container-border-color) solid;
	  width: 530px;
  }
  #Bingo-board {
    position: absolute;
    top: 460px;
    left: 667px;
    border: 2px var(--container-border-color) solid;
    width:585px;
    height:412px;
  }
  #game {
    background-image: url("../../../static/middle-info-background.png");
    position: absolute;
    top: 125px;
    left: 667px;
    width: 386px;
    border: 2px var(--container-border-color) solid;
    height: 165px;
  }
  #fillleft {
    position: absolute;
    top: 0px;
    height: 1080px;
    left: 0px;
    width: 660px;
    border: 2px var(--container-border-color) solid;
  }
  #fillright {
    position: absolute;
    top: 0px;
    height: 1080px;
    left: 1260px;
    width: 660px;
    border: 2px var(--container-border-color) solid;
  }
  #timer{
    position: absolute;
    top: 293px;
    left: 667px;
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

  #fillupperplayers {
	  top: 0px;
  }
  #filllowerplayers {
	  top: 870px;
  }

</style>
