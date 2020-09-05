<template>
	<div class="Interview">
	<!--<img src="../../../static/logo-summer-wide.png" id="logo">-->
    <div id="fillvoice" class="flexContainer"></div>
    <player-info id="pi1" playerIndex="0" height=45px></player-info>
    <player-info id="pi2" playerIndex="1" height=45px></player-info>
	  <div id="game"	class="flexContainer">
		<test-game-container id="gamec"></test-game-container>
	    <img src="../../../static/Super_Mario_Sunshine_logo.png" id="logo">
	  </div>
    <test-timer-container id="timer"></test-timer-container>
    <bingo-board id="Bingo-board" fontSize="20px"></bingo-board>
    <discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="114px" maxUserCount="6"></discord-voice-display>
	</div>
</template>

<script lang="ts">
	import { Component, Vue } from "vue-property-decorator";
  import TestTimerContainer from "../components/timerContainer.vue";
	import TestGameContainer from "../components/gameContainer.vue";
  import BingoBoard from "../components/bingoboard.vue";
  import PlayerInfo from "../components/playerInfo.vue";
  import TeamInfo from "../components/teamInfo.vue";
  import PlayerTeamContainer from "../components/playerTeamContainer.vue";
  import DiscordVoiceDisplay from "../components/discordVoiceDisplay.vue";

	@Component({
		components: {
			BingoBoard,
      TestGameContainer,
      PlayerInfo,
      TeamInfo,
      PlayerTeamContainer,
      TestTimerContainer,
      DiscordVoiceDisplay,
		}
	})

	export default class Interview extends Vue {
	}
</script>

<style scoped>
	.Interview {
		position: absolute;
		left: 0px;
		top: 0px;
		width: 1935px;
		height: 1090px;
		background-size: cover;
		background-image: url("../../../static/background-sunshine.jpg");
		background-repeat: no-repeat;
	}
	#discord-voice {
		position: absolute;
		top: 650px;
		left: 1330px;
		width: 500px;
		height: 200px;
		background-color: var(--container-background-color);
	}
	#logo{
		position: absolute;
		left: 690px;
		top: 10px;
		width: 568px;
		height: 200px;
	}
	#pi1 {
		position: absolute;
		top: 650px;
		left: 90px;
		width: 500px;
	}
	#pi2 {
		position: absolute;
		top: 750px;
		left: 90px;
		width: 500px;
	}
	#Bingo-board {
		position: absolute;
		top: 500px;
		left: 710px;
		width: 500px;
		height: 500px;
	}
	#game {
		position: absolute;
		top: 50px;
		left: 460px;
		width: 1000px;
		height: 100px;
	}
	#gamec {
		position: absolute;
		left: 0px;
		width: 1000px;
		top: 200px;
	}
	#logo {
		position: absolute;
		height: 150px;
		width: 255px;
		top: 25px;
		left: 370px;
	}
	#timer{
		position: absolute;
		top: 325px;
		left: 710px;
		width: 500px;
		height: 150px;
	}
</style>
