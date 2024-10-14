<template>
    <div id="focus-5p">
        <div id="background"></div>
        <div class="stream-placeholder" id="stream-focus"></div>
        <score-player-info id="info-focus" height="80px" :playerIndex="focusPlayer"></score-player-info>
        <div class="stream-placeholder small-stream-common" id="stream1"></div>
        <score-player-info class="small-info-common" id="info1" height="34px" :playerIndex="playerForSlot(0)"></score-player-info>
        <!-- <PlayerInfoComponent id="player2" :player-index="1" height="30px" /> -->
        <div class="stream-placeholder small-stream-common" id="stream2"></div>
        <score-player-info class="small-info-common" id="info2" height="34px" :playerIndex="playerForSlot(1)"></score-player-info>
        <div class="stream-placeholder small-stream-common" id="stream3"></div>
        <score-player-info class="small-info-common" id="info3" height="32px" :playerIndex="playerForSlot(2)"></score-player-info>
        <div class="stream-placeholder small-stream-common" id="stream4"></div>
        <score-player-info class="small-info-common" id="info4" height="32px" :playerIndex="playerForSlot(3)"></score-player-info>
        <discord-voice-display
            id="discord-voice"
            :class="{ hasTimer }"
            iconHeight="40px"
            nameWidth="140px"
            maxUserCount="8"
            :removePlayers="true"
        ></discord-voice-display>
        <div v-if="hasTimer" id="timer-box">
          <layout-timer v-if="hasTimer" fontSize="150px" id="timer"></layout-timer>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { store } from '@/browser-util/state';
    import { RunData } from '../../../speedcontrol-types';
    import TextFit from '../helpers/text-fit.vue';
    import ScorePlayerInfo from '../components/ScorePlayerInfo.vue';
import DiscordVoiceDisplay from '../components/discordVoiceDisplay.vue';
import LayoutTimer from '../components/layoutTimer.vue';

    @Component({
        components: {
            TextFit,
            ScorePlayerInfo,
            DiscordVoiceDisplay,
            LayoutTimer,
        }
    })
    export default class FivePlayerFocus extends Vue {
        get focusPlayer(): number {
            return parseInt(new URLSearchParams(window.location.search).get("focus") ?? "0")
        }

        get hasTimer(): boolean {
          return store.state.layoutMeta.showTimer;
        }

        playerForSlot(slot: number): number {
            if (slot >= this.focusPlayer) {
                return slot + 1;
            } else {
                return slot;
            }
        }
    }
</script>

<style>
    
  body {
    margin: 0;
    padding: 0;
  }
  #background {
    position: absolute;
    width: 1920px;
    height: 1080px;
    background-size: cover;
    background-repeat: no-repeat;
    background-image: linear-gradient(grey, #554d4d);
    filter: sepia(100%) saturate(360%) brightness(40%) hue-rotate(298deg) blur(3px);
  }
  .stream-placeholder {
    position: absolute;
    background: green;
    border: 2px white solid;
  }
  #stream-focus {
    width: 1528px;
    height: 860px;
  }
  #info-focus {
    position: absolute;
    top: 862px;
    border: 2px white solid;
    width: 800px;
    font-size: 68px;
  }
  .small-stream-common {
    width: 388px;
    height: 220px;
    left: 1528px;
  }
  .small-info-common {
    left: 1528px;
    position: absolute;
    width: 374px;
    border: 2px white solid;
  }
  #stream1 {
    top: 0px;
  }
  #info1 {
    top: 222px;
  }
  #stream2 {
    top: 271px;
  }
  #info2 {
    top: 490px;
  }
  #stream3 {
    top: 540px;
  }
  #info3 {
    top: 761px;
  }
  #stream4 {
    top: 809px;
  }
  #info4 {
    top: 1030px;
  }
  #discord-voice {
    position: absolute;
    top: 861px;
    left: 815px;
    width: 715px;
    height: 216px;
  }
  #discord-voice.hasTimer {
    top: 958px;
    left: 0px;
    width: 813px;
    height: 117px;
  }
  #timer-box {
    position: absolute;
    top: 862px;
    left: 816px;
    width: 710px;
    height: 214px;
    border: 2px solid white;
    display: flex;
    justify-content: center;
    align-content: center;
  }
</style>
