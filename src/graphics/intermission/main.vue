<template>
  <div id="Intermission">
    <div id="base_layout"></div>
    <run-upcoming
      v-if="nextRun"
      id="ComingUpNext"
      :data="nextRun"
    ></run-upcoming>
    <rotation></rotation>
    <info-storage-box
      id="ReaderAndMusic"
    >
    <div class="Mic">
			<img src="components/Mic.png">
		</div>
		<DiscordVoiceDisplay v-show="hostsSpeakingDuringIntermission" voiceHighlightColor="var(--darker-main-color)"></DiscordVoiceDisplay>
      <!--<reader></reader>-->
      <music></music>
    </info-storage-box>
	  
    <div :class="'ImageView '+(showIntermissionImage?'PictureShown':'')">
      <img v-if="showIntermissionImage" :src="intermissionImageUrl">
    </div>
    <ticker id="ticker"></ticker>
    <donation-total id="donation-total"></donation-total>
    <div id="direct_relief_logo"></div>
    <div id="speedyfists_logo"></div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import Logo from './components/Logo.vue';
import Rotation from './components/Rotation.vue';
import {store, getReplicant} from "../../browser-util/state";
import RunUpcoming from "./components/RunUpcoming.vue";
import {RunData} from "../../../speedcontrol-types";
import InfoStorageBox from "../_misc/components/InfoStorageBox.vue";
import DiscordVoiceDisplay from "../components/discordVoiceDisplay.vue";
import BingoBoard from "../components/bingoboard.vue";
import Music from './components/Music.vue';
import DonationTotal from "../omnibar/components/DonationTotal.vue";
import Ticker from "../omnibar/components/Ticker.vue";
/*import CutBackground from '../_misc/cut_bg';
import Reader from './components/Reader.vue';
*/

@Component({
    components: {
        Logo,
        Rotation,
        RunUpcoming,
		InfoStorageBox,
        Music,
    DiscordVoiceDisplay,
    BingoBoard,
      /*SponsorLogos,
      InfoStorageBox,
      Capture,
      Reader,
      ,
      AdTimer,*/
      DonationTotal,
      Ticker
    },
})

export default class Intermission extends Vue{
  @Prop({default: undefined})
  data;

  nextRun: RunData = null;

  created() {
    this.refreshUpcomingRun();
  }

  mounted() {
    nodecg.listenFor('forceRefreshIntermission', this.refreshUpcomingRun);
  }

  refreshUpcomingRun() {
      const curRun = store.state.runDataActiveRun;
	  const nextRun = store.state.runDataArray[this.findRunIndex(curRun) + 1];
	  if (nextRun) {
	      this.nextRun = nextRun;
	  }
  }

  get hostsSpeakingDuringIntermission(): boolean {
    return store.state.hostsSpeakingDuringIntermission.speaking;
  }

  get showIntermissionImage(): boolean {
    return !!store.state.showPictureDuringIntermission.imageUrl;
  }

  get intermissionImageUrl(): string {
    return store.state.showPictureDuringIntermission.imageUrl;
  }

    findRunIndex(run : RunData): number {
        let curRunID = run.id;
        if (!curRunID) {
            return -1;
        }
        return store.state.runDataArray.findIndex(run => run.id === curRunID);
    }
};
</script>

<style>
  #Intermission {
    height: 900px;
    overflow: hidden;
  }
  #base_layout {
    position: absolute;
    background: url("../../../static/intermission-speedyfists.png");
    top:0px;
    left:0px;
    width: 1920px;
    height: 1080px;
  }
  #logo {
	position: absolute;
    left: 48px;
    top: 5px;
    width: 631px;
  }
  #ComingUpNext {
    position: absolute;
    left: 1267px;
    top: 105px;
    width: 637px;
    height: 199px;
    color: white;
  }
  #host-bingo-text{
    width: 100%;
    font-weight: 500;
    height: 60px;
    line-height: 60px;
    color: #fff;
    font-size: 41px;
    text-transform: uppercase;
    position: absolute;
    left: 105px;
    top: 237px;
  }
  #Rotation {

    left: 1278px;
    top: 324px;
    width: 637px;
    height: 660px;
    color: white;
  }
  #ReaderAndMusic {
    justify-content: flex-start;
    flex-direction: row;
    background-color: rgba(147, 100, 147, 0.3);
    left: 211px;
    top: 992px;
    width: 1040px;
    height: 60px;
    font-size: 30px;
}

  .DiscordVoiceDisplay {
	  left: 750px;
	  top: 920px;
  }

  .Music {
    position: absolute;
    left: 730px;
  }

	body {
		
		/*background-color: rgba(98, 127, 190, 0.5)*/
	}

  .ImageView {
    position: absolute;
    top: 300px;
    height: 670px;
    width: 670px;
    left: 33px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .ImageView.PictureShown {
    background: rgba(147, 100, 147, 0.3);
  }

  .ImageView > img {
    max-width: 100%;
    max-height: 100%;
  }

  .RunUpcoming > .Header {
    font-size: 21px;
  }
  #donation-total {
    position: absolute;
    top: 746px;
    left: 600px;
    color: #fff;
    font-size: 42px;
    width: 300px;
    text-align: center;
}

#ticker {
    position: absolute;
    top: 587px;
    left: 399px;
    color: #fff;
    width: 766px;
    text-align: center;
}

#direct_relief_logo {
    position: absolute;
    top: 876px;
    left: 600px;
    width: 300px;
    height: 61px;
    background: url("../../../static/direct-relief.png");
    background-size: 300px 61px;
    background-repeat: no-repeat;
}

#speedyfists_logo {
    position: absolute;
    top: 646px;
    left: 600px;
    width: 300px;
    height: 237px;
    background: url("../../../static/speedyfists.png");
    background-size: 300px;
    background-repeat: no-repeat;
    opacity: 0.2;
}
</style>
