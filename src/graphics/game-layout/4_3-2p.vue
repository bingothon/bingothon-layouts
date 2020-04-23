<template>
	<div>
    <div id="base_layout"></div>
    <player-info id="pi1" playerIndex="0" height=50px></player-info>
    <player-info id="pi2" playerIndex="1" height=50px></player-info>
		<test-game-container id="game"></test-game-container>
    <test-timer-container id="timer"></test-timer-container>
    <discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="114px"></discord-voice-display>
    <twitch-player id="stream1" streamIndex="0"></twitch-player>
		<twitch-player id="stream2" streamIndex="1"></twitch-player>
    <ticker id="ticker"></ticker>
    <donation-total id="donation-total"></donation-total>
    <estimate-container id="estimate-container"></estimate-container>
    <game-category-container id="game-category-container"></game-category-container>
    <div id="direct_relief_logo"></div>
	</div>
</template>

<script lang="ts">
	import { Component, Vue, Watch, Prop } from "vue-property-decorator";
	import { nodecg, NodeCG } from "../../browser-util/nodecg";
	import { store, getReplicant } from "../../browser-util/state";
  import TestTimerContainer from "../components/timerContainer.vue";
	import TestGameContainer from "../components/gameContainer.vue";
  import PlayerInfo from "../components/playerInfo.vue";
  import TeamInfo from "../components/teamInfo.vue";
  import PlayerTeamContainer from "../components/playerTeamContainer.vue";
  import DiscordVoiceDisplay from "../components/discordVoiceDisplay.vue";
  import TwitchPlayer from "../components/twitchPlayer.vue";
  import DonationTotal from "../omnibar/components/DonationTotal.vue";
  import Ticker from "../omnibar/components/Ticker.vue";
  import EstimateContainer from "../components/estimateContainer.vue";
  import GameCategoryContainer from "../components/gameCategoryContainer.vue";
  import { RunDataPlayer, RunDataTeam } from "../../../speedcontrol-types";

	@Component({
		components: {
      TestGameContainer,
      PlayerInfo,
      TeamInfo,
      PlayerTeamContainer,
      TestTimerContainer,
      DiscordVoiceDisplay,
      TwitchPlayer,
      DonationTotal,
      Ticker,
      EstimateContainer,
      GameCategoryContainer
		}
	})

	export default class GameLayout extends Vue {
    get teams(): RunDataTeam[] {
      return store.state.runDataActiveRun.teams;
    }
	}
</script>

<style scoped>
  #base_layout {
    position: absolute;
    background: url("../../../static/4_3_2p-speedyfists.png");
    top:0px;
    left:0px;
    width: 1920px;
    height: 1080px;
  }

  #discord-voice {
    position: absolute;
    top: 757px;
    left: 960px;
    width: 960px;
    height: 176px;
}

  #pi1 {
    position: absolute;
    top: 717px;
    left: -16px;
    width: 968px;
}
  #pi2 {
    position: absolute;
    top: 717px;
    left: 944px;
    width: 968px;
}

  #game {
    position: absolute;
    top: 935px;
    left: 113px;
    width: 794px;
    height: 87px;
    font-size: 45px;
    color: #fff;
}

  #timer {
    position: absolute;
    top: 962px;
    left: 1295px;
    width: 233px;
    height: 77px;
    display: flex;
    align-items: last baseline;
    font-size: 82px;
}

  #stream1 {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 959px;
    height: 720px;
}
  #stream2 {
    position: absolute;
    top: 0px;
    left: 961px;
    width: 959px;
    height: 720px;
}

#donation-total {
    position: absolute;
    top: 815px;
    left: 320px;
    color: #fff;
    font-size: 42px;
    width: 253px;
    text-align: center;
}

#ticker {
    position: absolute;
    top: 796px;
    left: 561px;
    color: #fff;
    width: 456px;
}

#direct_relief_logo {
    position: absolute;
    top: 810px;
    left: 24px;
    width: 300px;
    height: 61px;
    background: url("../../../static/direct-relief.png");
    background-size: 300px 61px;
    background-repeat: no-repeat;
}

.EstimateBox {
    font-size: 36px;
    position: absolute;
    color: #0080AF;
    top: 1037px;
    left: 1077px;
}

.TimerBox {
    font-weight: 500;
    font-size: 74px;
    transition: 1s;
    align-content: center;
    text-align: center;
    position: absolute;
    left: 470px;
    top: -31px;
}

#game-category-container {
    top: 1024px;
    left: 113px;
    position: absolute;
    color: #0080AF;
    text-align: left;
    font-size: 31px;
    width: 795px;
    height: 60px;
}

</style>
