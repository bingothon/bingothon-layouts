<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    v-if="show"
    class="TimerContainer RunInfoBox FlexContainer"
  >
    <div
      class="TimerBox RunInfoBox FlexContainer"
      :class="timerStateClass"
      v-html="time"
    ></div>
    
    </div>
  <!-- eslint-enable -->
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { store } from '../../browser-util/state';
import { Timer } from "../../../speedcontrol-types";

@Component({})
export default class TestTimerContainer extends Vue {
    show = true;
    backupTimerTO: NodeJS.Timer = null;
    time = '';
    timerStateClass = 'running';
    updateDataUnwatch;

    mounted() {
        // save callback for unwatch
        this.updateDataUnwatch = store.watch((state) => state.timer, this.updateData, {immediate: true});
    }

    destroyed() {
      this.updateDataUnwatch();
    }
  
    updateData(timer: Timer) {
      this.time = this.splitStringToSpans(timer.time);
      /*switch (timer.state) {
      default:
      case 'running':
        this.textColor = getComputedStyle(document.documentElement).getPropertyValue('--timer-colour') || 'red';
        break;
      case 'paused':
      case 'stopped':
        this.textColor = getComputedStyle(document.documentElement).getPropertyValue('--timer-paused-colour') || 'grey';
        break;
      case 'finished':
        this.textColor = getComputedStyle(document.documentElement).getPropertyValue('--timer-finish-colour') || 'blue';
      }*/
      this.timerStateClass = timer.state || 'stopped';
      // Backup timer (see below).
      clearTimeout(this.backupTimerTO);
      this.backupTimerTO = setTimeout(this.backupTimer, 1000);
    }
    splitStringToSpans(string) {
      return string.replace(/\S/g, '<span>$&</span>');
    }
    // Backup timer that takes over if the connection to the server is lost.
    // Based on the last timestamp that was received.
    // When the connection is restored, the server timer will recover and take over again.
    backupTimer() {
      this.backupTimerTO = setTimeout(this.backupTimer, 200);
      const timer = store.state.timer;
      if (timer.state === 'running') {
        const missedTime = Date.now() - timer.timestamp;
        const timeOffset = timer.milliseconds + missedTime;
        this.time = this.splitStringToSpans(this.msToDuration(timeOffset));
      }
    }
    msToDuration(ms) {
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / (1000 * 60)) % 60);
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const hoursStr = (hours < 10) ? `0${hours}` : `${hours}`;
      const minutesStr = (minutes < 10) ? `0${minutes}` : `${minutes}`;
      const secondsStr = (seconds < 10) ? `0${seconds}` : `${seconds}`;
      return `${hoursStr}:${minutesStr}:${secondsStr}`;
    }
}
</script>

<style scoped>
  .TimerContainer {
    flex-direction: column;
    color: white;
  }
  .TimerBox {
    font-weight: 500;
    transition: 1s;
    align-content: center;
    text-align: center;
  }
  /* Each character in the timer is in a span; setting width so the numbers appear monospaced. */
  .TimerBox >>> span {
    display: inline-block;
    margin: 0.01em;
    text-align: center;
    font-weight: bold;
    width: 0.8em;
  }
  .TimerBox >>> span:nth-of-type(3), .TimerBox >>> span:nth-of-type(6) {
    width: 0.22em;
    margin-top: -0.15em; /* Make the colon appear more towards the centre. */
  }
  .TimerBox.running {
    color: white;
  }

  .TimerBox.paused, .TimerBox.stopped {
    color: gray;
  }

  .TimerBox.finished {
    color: blue;
  }

</style>
