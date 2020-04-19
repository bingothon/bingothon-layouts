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
      Ticker
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
    top: 100px;
    left: 0px;
    width: 310px;
    height: 391px;
}

  #pi1 {
    position: absolute;
    top: 966px;
    left: 1461px;
    width: 382px;
}

  #game {
    position: absolute;
    top: 978px;
    left: 434px;
    width: 566px;
    height: 92px;
}

  #timer{
    position: absolute;
    top: 1002px;
    left: 1018px;
    width: 233px;
    height: 77px;
    display: flex;
    align-items: last baseline;
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

.GameContainer > .GameName {

    font-weight: 500;
    font-size: 42px;
    align-content: baseline;
    align-items: baseline;
    color: white;
    margin: 5px;
    position: absolute;
    top: -41px;
    width: 1003px;
    left: -114px;

}

.GameContainer > .GameExtra {

    font-size: 40px;
    font-weight: thin;
    align-content: center;
    color: #0080AF;
    text-align: center;
    top: 41px;
    position: absolute;

}

.EstimateBox[data-v-daeba4] {

    font-size: 40px;
    position: absolute;
    color: #0080AF;
    top: -27px;
    left: 48px;

}

.TimerBox[data-v-daeba4] {

    font-weight: 500;
    font-size: 74px;
    transition: 1s;
    align-content: center;
    text-align: center;
    position: absolute;
    left: 470px;
    top: -31px;

}

</style>
