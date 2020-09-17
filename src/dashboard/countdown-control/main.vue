<template>
  <div>
    Use enter to confirm
    <input
      v-model="time"
      type="text"
      @blur="abandonEdit"
      @keyup.enter="finishEdit"
    >
    <button @click="doStartStopAction">{{startStopActionName}}</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { nodecg } from '../../browser-util/nodecg';
import {
  TwitchStreams,
} from '../../../schemas';
import { store, getReplicant } from '../../browser-util/state';

const bingothonBundleName = 'bingothon-layouts';

@Component({})
export default class CountdownControl extends Vue {
  time: string = "00:00";
  get timerState(): string {
    return store.state.countdownTimer.state;
  }

  get timerTime(): string {
    return store.state.countdownTimer.time;
  }

  @Watch("timerTime", {immediate: true})
  updateTime(val: string): void {
    this.time = val;
  }

  abandonEdit(): void {
    this.time = this.timerTime;
  }

  finishEdit(): void {
    const match = this.time.match(/^(\d{1}|\d{2}):(\d{2})$/);
    if (match) {
      const seconds = parseInt(match[1]) * 60 + parseInt(match[2]);
      nodecg.sendMessageToBundle('countdownTimer:setTime', bingothonBundleName, seconds);
    }
    (event.target as HTMLTextAreaElement).blur();
  }

  get startStopActionName(): string {
    return store.state.countdownTimer.state !== 'stopped' ? 'Stop' : 'Start';
  }

  doStartStopAction(): void {
    if (store.state.countdownTimer.state !== 'stopped') {
      nodecg.sendMessageToBundle('countdownTimer:stop', bingothonBundleName);
    } else {
      nodecg.sendMessageToBundle('countdownTimer:start', bingothonBundleName);
    }
  }
}
</script>

<style>

</style>
