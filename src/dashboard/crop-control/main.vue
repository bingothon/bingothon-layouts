<template>
  <div>
    <select v-model="currentChannel">
      <option
        v-for="(channel, i) in currentChannelNames"
        :key="i"
        :value="channel"
      >
        {{ channel }}
      </option>
    </select>
    <div
      ref="resizeContainer"
      class="ResizeContainer"
      :style="{'width':`${containerWidth}px`,'height':`${containerHeight}px`}"
    >
      <div
        ref="twitchPlayer"
        class="TwitchPlayer"
        :style="{'left':`${containerLeft}px`,'top':`${containerTop}px`}"
      />
    </div>
    <div class="ResizeOptions">
      <span>Left:</span><input
        v-model="leftPercent"
        type="number"
      >
      <span>Top:</span><input
        v-model="topPercent"
        type="number"
      >
      <span>Width:</span><input
        v-model="widthPercent"
        type="number"
      >
      <span>Height:</span><input
        v-model="heightPercent"
        type="number"
      >
      <button @click="saveCropping">
        Save
      </button><span>{{ successMessage }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import {
  TwitchStreams,
} from '../../../schemas';
import { store, getReplicant } from '../../browser-util/state';

declare const Twitch: any;

const initWidth = 1024;
const initHeight = 576;

@Component({})
export default class CropControl extends Vue {
  leftPercent: number = 0;

  topPercent: number = 0;

  widthPercent: number = 100;

  heightPercent: number = 100;

  currentChannel: string = '';

  successMessage: string = '';

  player: any;

  mounted() {

  }

  createTwitchPlayer() {
    const playerOptions = {
      channel: this.currentChannel,
      width: initWidth,
      height: initHeight,
    };
    this.player = new Twitch.Player(this.$refs.twitchPlayer, playerOptions);
    this.player.pause();
    const stream = store.state.twitchStreams.find(s => s.channel === this.currentChannel);
    if (stream) {
      this.leftPercent = stream.leftPercent;
      this.topPercent = stream.topPercent;
      this.widthPercent = stream.widthPercent;
      this.heightPercent = stream.heightPercent;
    }
  }

  destroyTwitchPlayer() {
    this.player = null;
    // remove the iframe inside the twitchPlayer div
    (this.$refs.twitchPlayer as HTMLElement).innerHTML = '';
  }

  @Watch('currentChannel')
  rebuildTwitchPlayer() {
    this.destroyTwitchPlayer();
    this.createTwitchPlayer();
  }

  get currentChannelNames(): string[] {
    return store.state.twitchStreams.map(s => s.channel);
  }

  get containerLeft(): number {
    return this.leftPercent / 100 * initWidth;
  }

  get containerTop(): number {
    return this.topPercent / 100 * initHeight;
  }

  get containerWidth(): number {
    return initWidth * 100 / this.widthPercent;
  }

  get containerHeight(): number {
    return initHeight * 100 / this.heightPercent;
  }

  saveCropping() {
    const streamIndex = store.state.twitchStreams.findIndex(s => s.channel === this.currentChannel);
    if (streamIndex === -1) {
      return;
    }
    Object.assign(getReplicant<TwitchStreams>('twitchStreams').value[streamIndex],
      // turns out, they actually aren't numbers
      {
        widthPercent: parseInt(this.widthPercent as unknown as string, 10),
        heightPercent: parseInt(this.heightPercent as unknown as string, 10),
        leftPercent: parseInt(this.leftPercent as unknown as string, 10),
        topPercent: parseInt(this.topPercent as unknown as string, 10),
      });
  }
}
</script>

<style>
  .ResizeContainer {
    overflow: hidden;
    position: relative;
    background: green;
  }

  .ResizeContainer > .TwitchPlayer {
    overflow: hidden;
    position: absolute;
  }
</style>
