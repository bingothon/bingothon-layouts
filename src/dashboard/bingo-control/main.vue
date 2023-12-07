<template>
    <v-app>
        <span class="error-warning" v-if="errorMessage"> {{ errorMessage }}</span>
        <div class="d-flex justify-center line-buttons">
            <v-btn
                id="override-button"
                class="button"
                dark
                small
                @click="toggleManualScoreOverride"
                :style="`width: 100%`"
            >
                {{ manualScoreOverrideText }}
            </v-btn>
        </div>
        <div v-for="(color, i) in playerColors" :key="i">
            {{ playerNames[i] || `P${i}` }}:
            <v-row>
                <v-col>
                    <v-select :value="color" @input="updatePlayerColor(i, $event)" :items="allColors"></v-select>
                </v-col>
                <v-col v-show="isManualScoreOverride">
                    <v-text-field
                        v-model="manualScore[i]"
                        background-color="#455A64"
                        class="manual-score"
                        dark
                        solo
                        type="number"
                        @change="updateManualScore"
                    />
                </v-col>
            </v-row>
        </div>
        Select Board:
        <v-select v-model="currentBoardRep" :items="allBingoReps"></v-select>
        <!-- Normal Bingosync Stuff -->
        <div v-if="showExtraBingosyncOptions">
            <div>
                Room Code or URL:
                <v-text-field v-model="roomCode" background-color="#455A64" clearable solo dark />
            </div>
            <div>
                Passphrase:
                <v-text-field v-model="passphrase" background-color="#455A64" clearable solo dark />
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
        <!-- External board -->
        <div v-if="showExtraExternBoardOptions">
            <div>Currently active: {{ storeExternalBingoboardMeta.game }}</div>
            <v-radio-group
                v-model="externalBingoboardMeta.game"
                :value="externalBingoboardMeta.game"
                @change="updateExternalGame"
            >
                <v-radio value="none" label="None" />
                <v-radio value="ori1" label="Ori and the Blind Forest" />
                <v-radio value="ori2" label="Ori and the Will of the Wisps" />
                <v-radio value="deus-ex" label="Deus Ex" />
            </v-radio-group>
            <div v-if="externalBingoboardMeta.game == 'ori1'">
                <div>
                    BoardID:
                    <v-text-field
                        v-model="externalBingoboardMeta.boardID"
                        background-color="#455A64"
                        clearable
                        solo
                        single-line
                        dark
                    />
                </div>
                <div>
                    PlayerIDs (comma separated):
                    <v-text-field
                        v-model="externalBingoboardMeta.playerID"
                        background-color="#455A64"
                        clearable
                        solo
                        single-line
                        dark
                    />
                </div>
                <div>
                    Coop:
                    <v-checkbox dark v-model="externalBingoboardMeta.coop" label="Coop"></v-checkbox>
                </div>
            </div>
            <div v-if="externalBingoboardMeta.game == 'ori2'">
                <div>
                    Host (leave blank if unsure):
                    <v-text-field
                        v-model="externalBingoboardMeta.host"
                        background-color="#455A64"
                        clearable
                        solo
                        single-line
                        dark
                    />
                </div>
                <div>
                    Token:
                    <v-text-field
                        v-model="externalBingoboardMeta.token"
                        background-color="#455A64"
                        clearable
                        solo
                        single-line
                        dark
                    />
                </div>
            </div>
            <v-btn @click="externalBingoboardUpdate" class="button" small :style="'width: 100%'">
                Set external bingoboard config
            </v-btn>
        </div>

        <div class="boardOptions">
            <v-btn :disabled="currentBoardActive" @click="switchAction" small class="button" :style="`width: 100%`">
                {{ currentBoardActive ? '[Active] ' : '' }}Switch
            </v-btn>
            <v-btn class="button" dark small @click="toggleCard" :style="`width: 43%`">
                {{ toggleCardText }}
            </v-btn>
            <v-btn class="button" dark small @click="toggleColors" :style="`width: 43%`">
                {{ toggleColorsText }}
            </v-btn>
            <v-btn class="button" dark small @click="toggleCount" :style="`width: 100%`">
                {{ toggleCountText }}
            </v-btn>
        </div>
    </v-app>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import { nodecg } from '../../browser-util/nodecg';
    import { BingoboardMeta, CurrentMainBingoboard, ExternalBingoboardMeta } from '../../../schemas';
    import { getReplicant, store } from '../../browser-util/state';

    type ColorEnum = 'pink' | 'red' | 'orange' | 'brown' | 'yellow' | 'green' | 'teal' | 'blue' | 'navy' | 'purple';
    type BingoRepEnum = 'bingoboard' | 'externalBingoboard' | 'explorationBingoboard';

    const BOARD_TO_SOCKET_REP = { bingoboard: 'bingosyncSocket', hostingBingoboard: 'hostingBingosocket' };

    @Component({})
    export default class BingoControl extends Vue {
        roomCode: string = '';

        passphrase: string = '';

        currentBoardRep: BingoRepEnum = 'bingoboard';

        externalBingoboardMeta: ExternalBingoboardMeta = { game: 'none' };

        explorationCustomBoard: string = '';

        errorMessage: string = '';

        allColors = Object.freeze([
            'pink',
            'red',
            'orange',
            'brown',
            'yellow',
            'green',
            'teal',
            'blue',
            'navy',
            'purple',
        ]);

        allBingoReps: readonly BingoRepEnum[] = Object.freeze(['bingoboard', 'externalBingoboard']); //add back when need  'explorationBingoboard'

        mounted() {
            store.watch(
                (state) => state.currentMainBingoboard,
                (newVal) => {
                    this.currentBoardRep = newVal.boardReplicant;
                },
                { immediate: true },
            );
        }

        @Watch('storeExternalBingoboardMeta', { immediate: true })
        watchExternalBingoboard(meta: ExternalBingoboardMeta) {
            this.externalBingoboardMeta = meta;
        }

        /**
         COMPUTED PROPERTIES
         **/
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
                    return !!this.roomCode && !!this.passphrase;
                case 'connecting':
                default:
                    return false;
            }
        }

        get showExtraBingosyncOptions(): boolean {
            return ['bingoboard', 'hostingBingoboard'].includes(this.currentBoardRep);
        }

        get showExtraExternBoardOptions(): boolean {
            return this.currentBoardRep === 'externalBingoboard';
        }

        get showExtraExplorationOptions(): boolean {
            return this.currentBoardRep === 'explorationBingoboard';
        }

        get currentBoardActive(): boolean {
            return this.currentBoardRep === store.state.currentMainBingoboard.boardReplicant;
        }

        get manualScore(): string[] {
            return store.state.bingoboardMeta.manualScores.map((i) => `${i}`);
        }

        get storeExternalBingoboardMeta() {
            return store.state.externalBingoboardMeta;
        }

        get playerNames(): string[] {
            const teams = store.state.runDataActiveRun.teams;
            return teams.flatMap((team) => team.players.map((player) => player.name));
        }

        /**
         HANDLERS
         **/

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
                        nodecg.sendMessage('bingosync:leaveRoom', { name: this.currentBoardRep }).catch((error) => {
                            nodecg.log.error(error);
                            this.errorMessage = error.message;
                        });
                        break;
                    case 'disconnected':
                    case 'error':
                        this.errorMessage = '';
                        getReplicant<CurrentMainBingoboard>('currentMainBingoboard').value.boardReplicant = this
                            .currentBoardRep as BingoRepEnum;
                        nodecg
                            .sendMessage('bingosync:joinRoom', {
                                roomCode: this.roomCode,
                                passphrase: this.passphrase,
                                name: this.currentBoardRep,
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

        updateExploration() {
            try {
                const goals = JSON.parse(this.explorationCustomBoard);
                const onlyNames = goals.map((g) => g.name);
                nodecg.sendMessageToBundle('exploration:newGoals', 'bingothon-layouts', onlyNames).catch((e) => {
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
            getReplicant<CurrentMainBingoboard>('currentMainBingoboard').value.boardReplicant = this
                .currentBoardRep as BingoRepEnum;
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
            getReplicant<BingoboardMeta>('bingoboardMeta').value.manualScoreOverride =
                !store.state.bingoboardMeta.manualScoreOverride;
        }

        updateExternalGame() {
            console.log('Updating model');
            switch (this.externalBingoboardMeta.game) {
                case 'ori1': {
                    this.externalBingoboardMeta = {
                        game: 'ori1',
                        boardID: '',
                        playerID: '',
                        coop: false,
                    };
                    break;
                }
                case 'ori2': {
                    this.externalBingoboardMeta = {
                        game: 'ori2',
                        token: '',
                        host: '',
                    };
                    break;
                }
                case 'deus-ex': {
                    this.externalBingoboardMeta = {
                        game: 'deus-ex',
                    };
                    break;
                }
                default: {
                    this.externalBingoboardMeta = {
                        game: 'none',
                    };
                }
            }
        }

        externalBingoboardUpdate() {
            nodecg
                .sendMessageToBundle('externalBingoboard:configure', 'bingothon-layouts', this.externalBingoboardMeta)
                .then(() => (this.errorMessage = ''))
                .catch((error) => {
                    nodecg.log.error(error);
                    this.errorMessage = error.message;
                });
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
