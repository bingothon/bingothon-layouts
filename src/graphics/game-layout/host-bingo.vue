<template>
  <div>
    <div class="Interview"></div>
    <img src="../../../static/logo-winter-wide.png" id="logo">
	  <player-info id="pi1" playerIndex="0" height=45px></player-info>
	  <player-info id="pi2" playerIndex="1" height=45px></player-info>
    <twitch-player id="stream1" streamIndex="0"></twitch-player>
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
    get teams(): RunDataTeam[] {
      return store.state.runDataActiveRun.teams;
    }
	}
</script>

<style scoped>
	body{
		background: linear-gradient(-128deg, var(--gradient-light) 0, var(--gradient-dark) 100%) 100% no-repeat fixed;
	 }

  #stream1 {
    position: absolute;
    top: 175px;
    left: 360px;
    width: 1200px;
    height: 675px;
  }
	.Interview {
		position: absolute;
		top: 0px;
		left: 0px;
		width: 1920px;
		height: 1080px;
		background: linear-gradient(var(--darker-main-color), var(--lighter-main-color));
	}



  #logo{
	  position: absolute;
	  left: 650px;
	  top: -30px;
	  width: 666px;
	  height: 200px;
  }
  #pi1 {
	   position: absolute;
	   top: 850px;
	   left: 360px;
	   width: 500px;
	   background-image: linear-gradient(#373d6f, #2a2a54);
	   color: var(--font-color);
   }

	#pi2 {
		position: absolute;
		top: 850px;
		left: 1048px;
		width: 500px;
		background-image: linear-gradient(#373d6f, #2a2a54);
		color: var(--font-color);
	}
  #name {
	  top: 850px;
	  font-size: 60px;
	  margin-left: 10px;
  }
  #occupation {
	  top: 910px;
	  font-size: 20px;
	  margin-left: 10px;
  }
  #infoIVW1 {
	  position: absolute;
	  top: 456px;
	  left: 1300px;
	  height: 50px;
	  width: 500px;
	  background-image: linear-gradient(#373d6f, #2a2a54);
	  color: var(--font-color);
	  font-size: 40px;
  }

  #infoIVW2 {
	  position: absolute;
	  top: 900px;
	  left: 1300px;
	  height: 50px;
	  width: 500px;
	  background-image: linear-gradient(#373d6f, #2a2a54);
	  color: var(--font-color);
	  font-size: 40px;
  }
  #nameIVW1 {
	  margin-left: 10px;
  }
  #nameIVW2 {
	  margin-left: 10px;
  }
  #pe-logo > img {
	  object-fit: contain;
	  height: 100px;
  }
  #pe-logo {
	  position: absolute;
	  left: 800px;
  }
  #infotext {
	  position: absolute;
	  left: 0px;
  }
</style>
