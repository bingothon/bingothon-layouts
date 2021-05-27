<template>
	<div>
    <div id="fillleft" class="flexContainer"></div>
    <div id="fillright" class="flexContainer"></div>
		<twitch-player id="stream1" streamIndex="0"></twitch-player>
		<twitch-player id="stream2" streamIndex="1"></twitch-player>
		<twitch-player id="stream3" streamIndex="2"></twitch-player>
		<twitch-player id="stream4" streamIndex="3"></twitch-player>
    <div id="fillbar" class="flexContainer"></div>
    <div id="fillvoice" class="flexContainer"></div>
    <player-team-container id="ptc1" teamIndex="0" height="40px"></player-team-container>
		<test-game-container id="game"></test-game-container>
    <test-timer-container id="timer"></test-timer-container>
    <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
    <player-team-container id="ptc2" teamIndex="1" height="40px"></player-team-container>
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
  #stream2 {
    position: absolute;
    top: 0px;
    left: 1253px;
    width: 667px;
    height: 500px;
    border: 2px var(--container-border-color) solid;
  }
  #stream3 {
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
    height: 500px;
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
    top: 170px;
    left: 1053px;
    width: 200px;
    height: 290px;
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
  #ptc1 {
    position: absolute;
    top: 0px;
    left: 667px;
    border: 2px var(--container-border-color) solid;
    width: 586px;
  }
  #ptc2 {
    position: absolute;
    top: 830px;
    left: 667px;
    border: 2px var(--container-border-color) solid;
    width: 586px;
  }
  #Bingo-board {
    position: absolute;
    top: 460px;
    left: 667px;
    border: 2px var(--container-border-color) solid;
    width:586px;
    height:370px;
  }
  #game {
    background-image: url("../../../static/middle-info-background.png");
    position: absolute;
    top: 170px;
    left: 667px;
    width: 386px;
    border: 2px var(--container-border-color) solid;
    height: 145px;
  }
  #fillleft {
    position: absolute;
    top: 0px;
    height: 1080px;
    left: 0px;
    width: 660px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }
  #fillright {
    position: absolute;
    top: 0px;
    height: 1080px;
    left: 1260px;
    width: 660px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }
  #timer{
    position: absolute;
    top: 315px;
    left: 667px;
    background-image: url("../../../static/middle-info-background.png");
    width: 386px;
    border: 2px var(--container-border-color) solid;
    height: 145px;
  }
  #player0 {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 667px;
    height: 500px;
  }
  #player1 {
    position: absolute;
    top: 0px;
    left: 1255px;
    width: 667px;
    height: 500px;
  }
  #player2 {
    position: absolute;
    top: 501px;
    left: 0px;
    width: 667px;
    height: 500px;
  }
  #player3 {
    position: absolute;
    top: 501px;
    left: 1255px;
    width: 667px;
    height: 500px;
  }
</style>
