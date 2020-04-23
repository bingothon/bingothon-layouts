<template>
	<div>
    <div id="base_layout"></div>
    <player-info id="pi1" playerIndex="0" height=30px></player-info>
    <player-info id="pi2" playerIndex="1" height=30px></player-info>
    <player-info id="pi3" playerIndex="2" height=30px></player-info>
    <player-info id="pi4" playerIndex="3" height=30px></player-info>
		<test-game-container id="game"></test-game-container>
    <test-timer-container id="timer"></test-timer-container>
    <discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="114px"></discord-voice-display>
    <twitch-player id="stream1" streamIndex="0"></twitch-player>
		<twitch-player id="stream2" streamIndex="1"></twitch-player>
		<twitch-player id="stream3" streamIndex="2"></twitch-player>
    <twitch-player id="stream4" streamIndex="3"></twitch-player>
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
    background: url("../../../static/4_3_4p-speedyfists.png");
    top:0px;
    left:0px;
    width: 1920px;
    height: 1080px;
  }

  #discord-voice {
    position: absolute;
    top: 0px;
    left: 724px;
    width: 471px;
    height: 110px;
}

  #pi1 {
    position: absolute;
    top: 493px;
    left: 707px;
    width: 242px;
  }
  #pi2 {
    position: absolute;
    top: 493px;
    left: 944px;
    width: 242px;
  }
  #pi3 {
    position: absolute;
    top: 543px;
    left: 944px;
    width: 242px;
  }
  #pi4 {
    position: absolute;
    top: 543px;
    left: 707px;
    width: 242px;
  }

  #game {
    position: absolute;
    top: 113px;
    left: 724px;
    width: 471px;
    height: 39px;
    font-size: 30px;
    color: #fff;
}

  #timer {
    position: absolute;
    top: 381px;
    left: 724px;
    width: 471px;
    height: 77px;
    display: flex;
    align-items: center;
    align-content: center;
    font-size: 69px;
}

#stream1 {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 720px;
    height: 540px;
}
#stream2 {
    position: absolute;
    top: 0px;
    left: 1199px;
    width: 720px;
    height: 540px;
}
#stream3 {
    position: absolute;
    top: 540px;
    left: 0px;
    width: 720px;
    height: 540px;
}
#stream4 {
    position: absolute;
    top: 540px;
    left: 1199px;
    width: 720px;
    height: 540px;
}

#donation-total {
    position: absolute;
    top: 940px;
    left: 1071px;
    color: #fff;
    font-size: 42px;
    width: 124px;
    text-align: center;
}

#ticker {
    position: absolute;
    top: 987px;
    left: 724px;
    color: #fff;
    width: 471px;
    height: 97px;
}

#direct_relief_logo {
    position: absolute;
    top: 928px;
    left: 776px;
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

.EstimateBox{
    font-size: 36px;
    position: absolute;
    color: #0080AF;
    top: 445px;
    left: 773px;
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
    top: 278px;
    left: 724px;
    position: absolute;
    color: #0080AF;
    text-align: left;
    font-size: 23px;
    width: 471px;
    height: 60px;
}

</style>
