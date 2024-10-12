<template>
    <div id="small-5p">
        <div class="stream-placeholder" id="stream0"></div>
        <score-player-info class="info-common" id="info0" height="80px" :playerIndex="0"></score-player-info>
        <div class="stream-placeholder" id="stream1"></div>
        <score-player-info class="info-common" id="info1" height="80px" :playerIndex="1"></score-player-info>
        <div class="stream-placeholder" id="stream2"></div>
        <score-player-info class="info-common" id="info2" height="80px" :playerIndex="2"></score-player-info>
        <div class="stream-placeholder" id="stream3"></div>
        <score-player-info class="info-common" id="info3" height="80px" :playerIndex="3"></score-player-info>
        <div class="stream-placeholder" id="stream4"></div>
        <score-player-info class="info-common" id="info4" height="80px" :playerIndex="4"></score-player-info>
        <discord-voice-display
            id="discord-voice"
            iconHeight="40px"
            nameWidth="125px"
            maxUserCount="12"
            :removePlayers="true"
        ></discord-voice-display>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { store } from '@/browser-util/state';
    import { RunData } from '../../../speedcontrol-types';
    import TextFit from '../helpers/text-fit.vue';
    import ScorePlayerInfo from '../components/ScorePlayerInfo.vue';
import DiscordVoiceDisplay from '../components/discordVoiceDisplay.vue';

    @Component({
        components: {
            TextFit,
            ScorePlayerInfo,
            DiscordVoiceDisplay
        }
    })
    export default class FivePlayerFocus extends Vue {
        get focusPlayer(): number {
            return parseInt(new URLSearchParams(window.location.search).get("focus") ?? "0")
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
  #small-5p {
    width: 1920px;
    height: 1080px;
    background: url(../middle-info-background.png);
    background-size: cover;
  }
  .stream-placeholder {
    position: absolute;
    background: green;
    border: 2px white solid;
    width: 638px;
    height: 380px;
  }
  .info-common {
    position: absolute;
    border: 2px white solid;
    top: 382px;
    width: 624px;
  }
  #stream0 {
    top: 0px;
    left: 0px;
  }
  #info0 {
    top: 382px;
  }
  #stream1 {
    top: 0px;
    left: 640px;
  }
  #info1 {
    top: 382px;
    left: 640px;
  }
  #stream2 {
    top: 0px;
    left: 1280px;
  }
  #info2 {
    top: 382px;
    left: 1280px;
  }
  #stream3 {
    top: 478px;
  }
  #info3 {
    top: 860px;
  }
  #stream4 {
    top: 478px;
    left: 640px;
  }
  #info4 {
    top: 860px;
    left: 640px;
  }
  #discord-voice {
    position: absolute;
    top: 488px;
    left: 1283px;
    width: 630px;
    height: 408px;
  }
</style>
