<template>
    <v-app>
        <span
            class="error-warning"
            @click="errorMessage=''"
        > {{ errorMessage }}</span>
        <div class="d-flex justify-center line-buttons">
            <v-btn id="override-button"
                   class="button"
                   dark
                   small
                   @click="toggleManualScoreOverride"
                   :style="`width: 100%`"
            >
                {{ manualScoreOverrideText }}
            </v-btn>
        </div>
        <div
            v-for="(color,i) in playerColors"
            :key="i"
        >
            P{{ i }}:
            <v-select
                :value="color"
                @input="updatePlayerColor(i, $event)"
                :items="allColors"
                :style="`width: 35%`"
            >
            </v-select>
            <span v-show="isManualScoreOverride">
                <v-text-field
                    v-model="manualScore[i]"
                    background-color="#455A64"
                    class="manual-score"
                    dark
                    type="number"
                    @change="updateManualScore"
                    :style="`width: 30%`"
                />
            </span>
        </div>
        Select Board:
        <v-select v-model="currentBoardRep"
                  :items="allBingoReps">
        </v-select>
        <div v-if="showExtraBingosyncOptions">
            <div>
                Room Code:
                <v-text-field v-model="roomCode" background-color="#455A64" dark/>
            </div>
            <div>
                Passphrase:
                <v-text-field v-model="passphrase" background-color="#455A64" dark/>
            </div>
            <div class="d-flex justify-center line-buttons">
                <v-btn
                    :disabled="!canDoConnectAction"
                    class="button"
                    dark
                    small
                    @click="connectAction"
                    :style="`width: 100%`"
                >
                    {{ connectActionText }}
                </v-btn>
            </div>
        </div>
        <div class="boardOptions">
            <v-btn
                class="button"
                dark
                small
                @click="toggleCard"
                :style="`width: 43%`"
            >
                {{ toggleCardText }}
            </v-btn>
            <v-btn
                class="button"
                dark
                small
                @click="toggleColors"
                :style="`width: 43%`"
            >
                {{ toggleColorsText }}
            </v-btn>
            <v-btn
                class="button"
                dark
                small
                @click="toggleCount"
                :style="`width: 100%`"
            >
                {{ toggleCountText }}
            </v-btn>
        </div>
    </v-app>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import {nodecg} from '../../browser-util/nodecg';
import {BingoboardMeta, CurrentMainBingoboard,} from '../../../schemas';
import {getReplicant, store} from '../../browser-util/state';

type ColorEnum = ('pink' | 'red' | 'orange' | 'brown' | 'yellow' | 'green' | 'teal' | 'blue' | 'navy' | 'purple');
type BingoRepEnum = ('bingoboard' | 'oriBingoboard' | 'hostingBingoboard' | 'explorationBingoboard');

const BOARD_TO_SOCKET_REP = {bingoboard: 'bingosyncSocket', hostingBingoboard: 'hostingBingosocket'};

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
        }, {immediate: true});
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
        return 'Enable Manual Score Override';
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
        this.manualScore.forEach((score: string, idx: number) => {
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
                    nodecg.sendMessage('bingosync:leaveRoom', {name: this.currentBoardRep})
                        .catch((error) => {
                            nodecg.log.error(error);
                            this.errorMessage = error.message;
                        });
                    break;
                case 'disconnected':
                case 'error':
                    getReplicant<CurrentMainBingoboard>('currentMainBingoboard').value.boardReplicant = this.currentBoardRep as BingoRepEnum;
                    nodecg.sendMessage('bingosync:joinRoom', {
                        roomCode: this.roomCode,
                        passphrase: this.passphrase,
                        name: this.currentBoardRep
                    })
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
            nodecg.sendMessage('oriBingo:activate', {boardID: this.oriBoardID, playerID: this.oriPlayerID})
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

    updatePlayerColor(idx: number, val: any) {
        getReplicant<BingoboardMeta>('bingoboardMeta').value.playerColors[idx] = val;
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
.v-app {
    width: 100%;
}

#app {
    width: 100%;
}

.error-warning {
    color: red;
    font-size: small;
}

input.manual-score {
    width: 3em;
}

.override {
    width: 100%;
}

.lineButton >>> .v-btn {
    width: 100%;
    margin-bottom: 4px;
    margin-top: 4px;
}

.v-btn:not(.v-btn--round).v-size--x-small {
    margin: 2px;
}

.halfLine >>> .v-btn {
    width: 49%;
}

.v-btn {
    margin: 5px;
}
</style>
