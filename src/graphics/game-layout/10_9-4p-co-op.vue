<template>
	<div>
    <div id="fillleft" class="flexContainer"></div>
    <div id="fillright" class="flexContainer"></div>
		<twitch-player id="stream1" streamIndex="1"></twitch-player>
		<twitch-player id="stream2" streamIndex="0"></twitch-player>
		<twitch-player id="stream3" streamIndex="3"></twitch-player>
		<twitch-player id="stream4" streamIndex="2"></twitch-player>
    <div id="fillbar" class="flexContainer"></div>
    <div id="fillvoice" class="flexContainer"></div>
		<player-team-container id="ptc1" team-index="0" height="40px" margin="100px"></player-team-container>
		<player-team-container id="ptc2" team-index="1" height="40px" margin="100px"></player-team-container>
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
  import DiscordVoiceDisplay from "../components/discordVoiceDisplay.vue";
  import TwitchPlayer from "../components/twitchStreamPlaceholder.vue";
  import { RunDataPlayer, RunDataTeam } from "../../../speedcontrol-types";
  import PlayerTeamContainer from "../components/playerTeamContainer.vue";

	@Component({
		components: {
        PlayerTeamContainer,
			BingoBoard,
      TestGameContainer,
      PlayerInfo,
      TeamInfo,
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
    width: 555px;
    height: 500px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }
  #stream2 {
    position: absolute;
    top: 0px;
    left: 1365px;
    width: 555px;
    height: 499px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }

	#stream3 {
		position: absolute;
		top: 500px;
		left: 0px;
		width: 555px;
		height: 500px;
		background-image: url("../../../static/middle-info-background.png");
		border: 2px var(--container-border-color) solid;
	}

	#stream4 {
		position: absolute;
		top: 500px;
		left: 1365px;
		width: 555px;
		height: 499px;
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
		top: 170px;
		left: 1056px;
		width: 309px;
		height: 328px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }

  .PlayerContainer >>> .PlayerInfoBox {
    height: 40px;
    font-size: 25px;
  }
  #ptc1 {
    position: absolute;
    top: 0px;
    left: 555px;
    border: 2px var(--container-border-color) solid;
    width: 810px;
  }

  #ptc2 {
		position: absolute;
		top: 830px;
		left: 555px;
		border: 2px var(--container-border-color) solid;
		width: 810px;
	}
  #Bingo-board {
    position: absolute;
    top: 500px;
    left: 555px;
    border: 2px var(--container-border-color) solid;
    width:810px;
    height:330px;
  }
  #game {
    background-image: url("../../../static/middle-info-background.png");
    position: absolute;
    top: 170px;
    left: 555px;
    width: 501px;
    border: 2px var(--container-border-color) solid;
    height: 180px;
  }
  #timer{
    position: absolute;
    top: 350px;
    left: 555px;
    background-image: url("../../../static/middle-info-background.png");
    width: 501px;
    border: 2px var(--container-border-color) solid;
    height: 150px;
  }

</style>
