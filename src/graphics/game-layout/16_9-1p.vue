<template>
	<div>
    <div id="base_layout"></div>
    <player-info id="pi1" playerIndex="0" height=45px hideSoundIcon="true"></player-info>
		<test-game-container id="game"></test-game-container>
    <test-timer-container id="timer"></test-timer-container>
    <discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="114px"></discord-voice-display>
    <twitch-player id="stream1" streamIndex="0"></twitch-player>
    <ticker id="ticker"></ticker>
    <donation-total id="donation-total"></donation-total>
    <estimate-container id="estimate-container"></estimate-container>
    <game-category-container id="game-category-container"></game-category-container>
    <div id="direct_relief_logo"></div>
    <div id="speedyfists_logo"></div>
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
    background: url("../../../static/16_9_1p-speedyfists.png");
    top:0px;
    left:0px;
    width: 1920px;
    height: 1080px;
  }

  #discord-voice {
    position: absolute;
    top: 214px;
    left: 0px;
    width: 310px;
    height: 391px;
}

  #pi1 {

    position: absolute;
    top: 903px;
    left: 1326px;
    width: 579px;

}

  #game {
    position: absolute;
    top: 937px;
    left: 320px;
    width: 1013px;
    height: 92px;
    font-size: 45px;
    color: #fff;
}

  #timer {
    position: absolute;
    top: 973px;
    left: 1590px;
    width: 233px;
    height: 77px;
    display: flex;
    align-items: last baseline;
    font-size: 70px;
}

  #stream1 {
    position: absolute;
    top: 0px;
    left: 320px;
    width: 1599px;
    height: 899px;
}

#donation-total {
    position: absolute;
    top: 940px;
    left: 0px;
    color: #fff;
    font-size: 42px;
    width: 300px;
    text-align: center;
}

#ticker {
    position: absolute;
    top: 540px;
    left: 0px;
    color: #fff;
    width: 316px;
}

#direct_relief_logo {
    position: absolute;
    top: 1010px;
    left: 8px;
    width: 300px;
    height: 61px;
    background: url("../../../static/direct-relief.png");
    background-size: 300px 61px;
    background-repeat: no-repeat;
}

#speedyfists_logo {
    position: absolute;
    top: 805px;
    left: 8px;
    width: 300px;
    height: 237px;
    background: url("../../../static/speedyfists.png");
    background-size: 300px;
    background-repeat: no-repeat;
    opacity: 0.0;
}

.EstimateBox {
    font-size: 40px;
    position: absolute;
    color: #0080AF;
    top: -27px;
    left: 48px;
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

.EstimateBox {
    font-size: 40px;
    position: absolute;
    color: #0080AF;
    top: 1036px;
    left: 1063px;
}

#game-category-container{
    top: 1044px;
    left: 428px;
    position: absolute;
    color: #0080AF;
    text-align: left;
    font-size: 24px;
}

</style>
