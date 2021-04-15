<template>
    <v-app>
        <v-select v-model="currentBingomode" :items="ALL_BINGO_MODES">
            <option
                v-for="(bingoMode, i) in ALL_BINGO_MODES"
                :key="i"
                :value="bingoMode"
            >
                {{ bingoMode }}
            </option>
        </v-select>
        <div
            v-if="isNotInvasion"
        >
            Color to marker overrides
            <div
                v-for="(markerRedirect, i) in markerRedirects"
                :key="i"
                class="override d-flex justify-center"
            >
                <v-select v-model="markerRedirect[0]" :items="ALL_COLORS" item-text="ALL_COLORS">
                    <option
                        v-for="(color, j) in ALL_COLORS"
                        :key="j"
                        :value="color"
                    >
                        {{ color }}
                    </option>
                </v-select>
                to
                <v-select v-model="markerRedirect[1]" :items="ALL_COLORS">
                    <option
                        v-for="(color, j) in ALL_COLORS"
                        :key="j"
                        :value="color"
                    >
                        {{ color }}
                    </option>
                </v-select>
                <v-btn
                    dark
                    x-small
                    @click="removeOverride(i)">
                    <v-icon size="16px">
                        mdi-minus-circle
                    </v-icon>
                </v-btn>
            </div>
            <div class="d-flex justify-center lineButton">
                <v-btn
                    dark
                    small
                    @click="addOverride"
                >
                    <v-icon>
                        mdi-plus-circle
                    </v-icon>
                </v-btn>
            </div>
        </div>
        <div v-else class="d-flex justify-center lineButton">
            <v-btn
                dark
                small
                @click="forceRefreshInvasion"
            >
                Force Refresh invasion
            </v-btn>
        </div>
        <div class="d-flex justify-center halfLine">
            <v-btn dark small @click="update">Update</v-btn>
            <v-btn dark small @click="reset">Reset</v-btn>
        </div>
    </v-app>
</template>

<script lang="ts">
import {Component, Vue, Watch} from 'vue-property-decorator';
import {nodecg} from '../../browser-util/nodecg';
import {BingoboardMode,} from '../../../schemas';
import {store} from '../../browser-util/state';
import clone from 'clone';

type ColorEnum = ('pink' | 'red' | 'orange' | 'brown' | 'yellow' | 'green' | 'teal' | 'blue' | 'navy' | 'purple');


@Component({})
export default class BingomodeControl extends Vue {

    ALL_BINGO_MODES = Object.freeze(['invasion', 'normal']);
    ALL_COLORS = Object.freeze(['pink', 'red', 'orange', 'brown', 'yellow', 'green', 'teal', 'blue', 'navy', 'purple']);
    currentBingomode: string = 'invasion';
    markerRedirects: [string, string][] = [];

    get bingoboardModeRep(): BingoboardMode {
        return store.state.bingoboardMode;
    }

    @Watch('bingoboardModeRep', {'immediate': true})
    reset(): void {
        this.currentBingomode = store.state.bingoboardMode.boardMode;
        this.markerRedirects = clone(store.state.bingoboardMode.markerRedirects);
    }

    update(): void {
        nodecg.sendMessage('bingomode:setBingoboardMode', {
            boardMode: this.currentBingomode,
            markerRedirects: this.markerRedirects
        });
    }

    addOverride(): void {
        this.markerRedirects.push(['red', 'red']);
    }

    removeOverride(index: number): void {
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
.override {
    width: 100%;
}

.lineButton > .v-btn {
    width: 100%;
    margin-bottom: 4px;
    margin-top: 4px;
}

.v-btn:not(.v-btn--round).v-size--x-small {
    margin: 5px;
}

.halfLine > .v-btn {
    width: 49%;
}

select {
    color: white;
    border: 1px white;
}

option {
    color: black;
}
</style>
