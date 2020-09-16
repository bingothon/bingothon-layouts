<template>
  <div>
    <select v-model="currentBingomode">
      <option
        v-for="(bingoMode, i) in ALL_BINGO_MODES"
        :key="i"
        :value="bingoMode"
      >
        {{ bingoMode }}
      </option>
    </select>
    <div
      v-if="isNotInvasion"
    >
      Color to marker overrides
      <div
        v-for="(markerRedirect, i) in markerRedirects"
        :key="i"
      >
        <select v-model="markerRedirect[0]">
          <option
            v-for="(color, j) in ALL_COLORS"
            :key="j"
            :value="color"
          >
            {{ color }}
          </option>
        </select>
        to
        <select v-model="markerRedirect[1]">
          <option
            v-for="(color, j) in ALL_COLORS"
            :key="j"
            :value="color"
          >
            {{ color }}
          </option>
        </select>
        <button @click="removeOverride(i)">-</button>
      </div>
      <button @click="addOverride">+</button>
    </div>
    <div v-else>
      <button @click="forceRefreshInvasion">Force Refresh invasion</button>
    </div>
    <button class="v-btn" @click="update">Update</button>
    <button class="v-btn" @click="reset">Reset</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { nodecg } from '../../browser-util/nodecg';
import {
  BingoboardMeta, CurrentMainBingoboard,
} from '../../../schemas';
import { store, getReplicant } from '../../browser-util/state';
import clone from 'clone';

type ColorEnum = ('pink' | 'red' | 'orange' | 'brown' | 'yellow' | 'green' | 'teal' | 'blue' | 'navy' | 'purple');


@Component({})
export default class BingomodeControl extends Vue {

  ALL_BINGO_MODES = Object.freeze(['invasion','normal']);
  ALL_COLORS = Object.freeze(['pink', 'red', 'orange', 'brown', 'yellow', 'green', 'teal', 'blue', 'navy', 'purple']);
  currentBingomode: string = 'invasion';
  markerRedirects: [string, string][] = [];

  mounted() {
    this.reset();
  }

  reset(): void {
    this.currentBingomode = store.state.bingoboardMode.boardMode;
    this.markerRedirects = clone(store.state.bingoboardMode.markerRedirects);
  }

  update(): void {
    nodecg.sendMessage('bingomode:setBingoboardMode', {boardMode: this.currentBingomode, markerRedirects: this.markerRedirects});
  }

  addOverride(): void {
    this.markerRedirects.push(['red','red']);
  }

  removeOverride(index: number): void{
    this.markerRedirects.splice(index, 1);
  }

  forceRefreshInvasion(): void {
    nodecg.sendMessage('bingomode:forceRefreshInvasion');
  }

  get isNotInvasion(): boolean {
    return this.currentBingomode !== 'invasion';
  }

}
</script>

<style>

</style>
