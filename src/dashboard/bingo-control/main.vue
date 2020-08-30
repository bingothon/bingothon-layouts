<template>
  <div>
    <!--<ul>
      <li
        v-for="(count,i) in colorCounts"
        :key="i"
      >
        {{ count["color"] }}:{{ count["count"] }}
      </li>
    </ul>-->
    <span
      class="error-warning"
      @click="errorMessage=''"
    > {{ errorMessage }}</span>
    <div>
      <button @click="toggleManualScoreOverride">
        {{ manualScoreOverrideText }}
      </button>
    </div>
    <div
      v-for="(color,i) in playerColors"
      :key="i"
    >
      P{{ i }}: <select
        :value="color"
        @change="updatePlayerColor(i, $event)"
      >
        <option
          v-for="(sColor,j) in allColors"
          :key="j"
          :value="sColor"
        >
          {{ sColor }}
        </option>
      </select>
      <span v-show="isManualScoreOverride">
        <input
          v-model="manualScore[i]"
          class="manual-score"
          type="number"
          @change="updateManualScore"
        >
      </span>
    </div>
    Select Board:
    <select v-model="currentBoardRep">
      <option
        v-for="(boardRep, i) in allBingoReps"
        :key="i"
        :value="boardRep"
      >
        {{ boardRep }}
      </option>
    </select>
    <div v-if="showExtraBingosyncOptions">
      <div>
        Room Code: <input v-model="roomCode">
      </div>
      <div>
        Passphrase: <input v-model="passphrase">
      </div>
      <div>
        <button
          :disabled="!canDoConnectAction"
          @click="connectAction"
        >
          {{ connectActionText }}
        </button>
      </div>
    </div>
    <div v-if="showExtraOriOptions">
      <div>
        BoardID: <input v-model="oriBoardID">
      </div>
      <div>
        PlayerID: <input v-model="oriPlayerID">
      </div>
      <button
        :disabled="!oriCanActivate"
        @click="toggleOriActivate"
      >
        {{ toggleOriText }}
      </button>
    </div>
    <div v-if="showExtraExplorationOptions">
      <div>
        Bingosync json:
        <input v-model="explorationCustomBoard">
      </div>
      <button @click="updateExploration">
        Update Exploration
      </button>
      <button @click="resetExploration">
        Reset Exploration
      </button>
    </div>
    <div>
      <button
        :disabled="currentBoardActive"
        @click="switchAction"
      >
        {{ currentBoardActive?"[Active] ":"" }}Switch
      </button>
      <button @click="toggleCard">
        {{ toggleCardText }}
      </button>
      <button @click="toggleColors">
        {{ toggleColorsText }}
      </button>
      <button @click="toggleCount">
        {{ toggleCountText }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { nodecg } from '../../browser-util/nodecg';
import {
  BingoboardMeta, CurrentMainBingoboard,
} from '../../../schemas';
import { store, getReplicant } from '../../browser-util/state';

type ColorEnum = ('pink' | 'red' | 'orange' | 'brown' | 'yellow' | 'green' | 'teal' | 'blue' | 'navy' | 'purple');
type BingoRepEnum = ('bingoboard'|'oriBingoboard'|'hostingBingoboard'|'explorationBingoboard');

const BOARD_TO_SOCKET_REP = { bingoboard: 'bingosyncSocket', hostingBingoboard: 'hostingBingosocket' };

@Component({})
export default class BingoControl extends Vue {
    roomCode: string = '';

    passphrase: string = '';

    currentBoardRep: BingoRepEnum = 'bingoboard';

    oriBoardID: string = '';

    oriPlayerID: string = '';

    explorationCustomBoard: string = ''

    errorMessage: string = '';

    allColors = Object.freeze(['pink', 'red', 'orange', 'brown', 'yellow', 'green', 'teal', 'blue', 'navy', 'purple']);

    allBingoReps: readonly BingoRepEnum[] = Object.freeze(['bingoboard', 'oriBingoboard', 'hostingBingoboard', 'explorationBingoboard']);

    mounted() {
      store.watch(state => state.currentMainBingoboard, (newVal) => {
        this.currentBoardRep = newVal.boardReplicant;
      }, { immediate: true });
    }

    // --- computed properties
    get connectActionText(): string {
      const socketRepName = BOARD_TO_SOCKET_REP[this.currentBoardRep];
      if (!socketRepName) {
        return 'invalid';
      }
      switch (store.state[socketRepName].status) {
        case 'connected':
          return 'disconnect';
        case 'disconnected':
        case 'error':
          return 'connect';
        case 'connecting':
          return 'connecting...';
        default:
          return 'invalid';
      }
    }

    get toggleCardText(): string {
      if (store.state.bingoboardMeta.boardHidden) {
        return 'Show Card';
      }
      return 'Hide Card';
    }

    get toggleColorsText(): string {
      if (store.state.bingoboardMeta.colorShown) {
        return 'Hide Colors';
      }
      return 'Show Colors';
    }

    get toggleCountText(): string {
      if (store.state.bingoboardMeta.countShown) {
        return 'Hide Goalcount';
      }
      return 'Show Goalcount';
    }

    get manualScoreOverrideText(): string {
      if (store.state.bingoboardMeta.manualScoreOverride) {
        return 'Disable Manual Score Override';
      }
      return 'Enable ManualScoreOverride';
    }

    get isManualScoreOverride(): boolean {
      return store.state.bingoboardMeta.manualScoreOverride;
    }

    get toggleOriText(): string {
      if (store.state.oriBingoMeta.active) {
        return 'Deactivate';
      }
      return 'Activate';
    }

    get oriCanActivate(): boolean {
      return !!this.oriBoardID && !!this.oriPlayerID;
    }

    get playerColors(): Array<ColorEnum> {
      return store.state.bingoboardMeta.playerColors;
    }

    get canDoConnectAction(): boolean {
      const socketRepName = BOARD_TO_SOCKET_REP[this.currentBoardRep];
      if (!socketRepName) {
        return false;
      }
      switch (store.state[socketRepName].status) {
        case 'connected':
          return true;
        case 'disconnected':
        case 'error':
          return (!!this.roomCode && !!this.passphrase);
        case 'connecting':
        default:
          return false;
      }
    }

    get showExtraBingosyncOptions(): boolean {
      return ['bingoboard', 'hostingBingoboard'].includes(this.currentBoardRep);
    }

    get showExtraOriOptions(): boolean {
      return this.currentBoardRep === 'oriBingoboard';
    }

    get showExtraExplorationOptions(): boolean {
      return this.currentBoardRep === 'explorationBingoboard';
    }

    get currentBoardActive(): boolean {
      return this.currentBoardRep === store.state.currentMainBingoboard.boardReplicant;
    }

    get manualScore(): string[] {
      return store.state.bingoboardMeta.manualScores.map(i => `${i}`);
    }

    // test
    /* get colorCounts(): Array<{color: string, count: number}> {
      const counts = store.state.bingoboardMeta.colorCounts;
      const countArray = [];
      for (const key in counts) {
        if (counts.hasOwnProperty(key)) {
          const element = counts[key];
          if (element > 0) {
            countArray.push({ color: key, count: element });
          }
        }
      }
      return countArray;
    } */

    // --- handlers

    updateManualScore() {
      this.manualScore.forEach((score : string, idx: number) => {
        getReplicant<BingoboardMeta>('bingoboardMeta').value.manualScores[idx] = parseInt(score, 10);
      });
    }

    connectAction() {
      // only expanded options for the bingosync connection,
      // otherwise something else is there to handle the board
      if (this.showExtraBingosyncOptions) {
        const socketRepName = BOARD_TO_SOCKET_REP[this.currentBoardRep];
        if (!socketRepName) {
          throw new Error('unreachable');
        }
        switch (store.state[socketRepName].status) {
          case 'connected':
            nodecg.sendMessage('bingosync:leaveRoom', { name: this.currentBoardRep })
              .catch((error) => {
                nodecg.log.error(error);
                this.errorMessage = error.message;
              });
            break;
          case 'disconnected':
          case 'error':
            getReplicant<CurrentMainBingoboard>('currentMainBingoboard').value.boardReplicant = this.currentBoardRep as BingoRepEnum;
            nodecg.sendMessage('bingosync:joinRoom', { roomCode: this.roomCode, passphrase: this.passphrase, name: this.currentBoardRep })
              .catch((error) => {
                nodecg.log.error(error);
                this.errorMessage = error.message;
              });
            break;
          default:
            break;
        }
      }
    }

    toggleOriActivate() {
      if (store.state.oriBingoMeta.active) {
        nodecg.sendMessage('oriBingo:deactivate');
      } else {
        nodecg.sendMessage('oriBingo:activate', { boardID: this.oriBoardID, playerID: this.oriPlayerID })
          .catch((error) => {
            nodecg.log.error(error);
            this.errorMessage = error.message;
          });
      }
    }

    updateExploration() {
      try {
        const goals = JSON.parse(this.explorationCustomBoard);
        const onlyNames = goals.map(g => g.name);
        nodecg.sendMessageToBundle('exploration:newGoals', 'bingothon-layouts', onlyNames)
          .catch((e) => {
            this.errorMessage = e.message;
            nodecg.log.error(e);
          });
      } catch (e) {
        this.errorMessage = "Couldn't parse the board";
      }
    }

    resetExploration() {
      nodecg.sendMessageToBundle('exploration:resetBoard', 'bingothon-layouts');
    }

    switchAction() {
      getReplicant<CurrentMainBingoboard>('currentMainBingoboard').value.boardReplicant = this.currentBoardRep as BingoRepEnum;
    }

    updatePlayerColor(idx: number, evt: any) {
      getReplicant<BingoboardMeta>('bingoboardMeta').value.playerColors[idx] = evt.target.value;
    }

    toggleCard() {
      getReplicant<BingoboardMeta>('bingoboardMeta').value.boardHidden = !store.state.bingoboardMeta.boardHidden;
    }

    toggleColors() {
      getReplicant<BingoboardMeta>('bingoboardMeta').value.colorShown = !store.state.bingoboardMeta.colorShown;
    }

    toggleCount() {
      getReplicant<BingoboardMeta>('bingoboardMeta').value.countShown = !store.state.bingoboardMeta.countShown;
    }

    toggleManualScoreOverride() {
      getReplicant<BingoboardMeta>('bingoboardMeta').value.manualScoreOverride = !store.state.bingoboardMeta.manualScoreOverride;
    }
}
</script>

<style>
  .error-warning {
    color: red;
    font-size: small;
  }

  input.manual-score {
    width: 3em;
  }
</style>
