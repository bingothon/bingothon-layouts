<template>
    <v-app>
        <v-select v-model="currentBingomode" :items="ALL_BINGO_MODES">
            <option v-for="(bingoMode, i) in ALL_BINGO_MODES" :key="i" :value="bingoMode">
                {{ bingoMode }}
            </option>
        </v-select>
        <div v-if="isNotInvasion">
            <v-checkbox dark v-model="alwaysShowMarkers" label="Always show markers"></v-checkbox>
            Color to marker overrides
            <div
                v-for="(markerRedirect, i) in markerRedirects"
                :key="i"
                class="override d-flex justify-center color-control"
            >
                <div class="bingomode-color-control">
                    <v-select
                        v-model="markerRedirect[0]"
                        v-bind:items="ALL_COLORS.options"
                        item-text="title"
                        item-value="title"
                    >
                        <template slot="selection" slot-scope="data">
                            <v-list-content v-bind:id="data.item.colorId">
                                <div style="height: 10px; width: 45px" />
                            </v-list-content>
                        </template>
                        <template slot="item" slot-scope="data">
                            <template v-if="typeof data.item !== 'object'">
                                <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
                                <v-list-tile-content v-text="data.item"></v-list-tile-content>
                            </template>
                            <template v-else>
                                <v-list-content>
                                    {{ data.item.title }}
                                </v-list-content>
                            </template>
                        </template>
                    </v-select>
                </div>
                <div id="fromToColor">&gt;</div>
                <div class="bingomode-color-control">
                    <v-select
                        v-model="markerRedirect[1]"
                        v-bind:items="ALL_COLORS.options"
                        item-text="title"
                        item-value="title"
                    >
                        <template slot="selection" slot-scope="data">
                            <v-list-content v-bind:id="data.item.colorId">
                                <div style="height: 10px; width: 45px" />
                            </v-list-content>
                        </template>
                        <template slot="item" slot-scope="data">
                            <template v-if="typeof data.item !== 'object'">
                                <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
                                <v-list-tile-content v-text="data.item"></v-list-tile-content>
                            </template>
                            <template v-else>
                                <v-list-content>
                                    {{ data.item.title }}
                                </v-list-content>
                            </template>
                        </template>
                    </v-select>
                </div>
                <v-btn dark x-small @click="removeOverride(i)">
                    <v-icon size="16px"> mdi-minus-circle </v-icon>
                </v-btn>
            </div>
            <div class="d-flex justify-center lineButton">
                <v-btn dark small @click="addOverride">
                    <v-icon> mdi-plus-circle </v-icon>
                </v-btn>
            </div>
        </div>
        <div v-else class="d-flex justify-center lineButton">
            <v-btn dark small @click="forceRefreshInvasion"> Force Refresh invasion </v-btn>
        </div>
        <div class="d-flex justify-center halfLine">
            <v-btn dark small @click="update">Update</v-btn>
            <v-btn dark small @click="reset">Reset</v-btn>
        </div>
    </v-app>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import { nodecg } from '../../browser-util/nodecg';
    import { BingoboardMode } from '../../../schemas';
    import { store } from '../../browser-util/state';
    import clone from 'clone';

    @Component({})
    export default class BingomodeControl extends Vue {
        ALL_BINGO_MODES = Object.freeze(['invasion', 'normal']);

        ALL_COLORS = {
            options: [
                {
                    title: 'pink',
                    colorId: 'color-control-pink',
                },
                {
                    title: 'red',
                    colorId: 'color-control-red',
                },
                {
                    title: 'orange',
                    colorId: 'color-control-orange',
                },
                {
                    title: 'brown',
                    colorId: 'color-control-brown',
                },
                {
                    title: 'yellow',
                    colorId: 'color-control-yellow',
                },
                {
                    title: 'green',
                    colorId: 'color-control-green',
                },
                {
                    title: 'teal',
                    colorId: 'color-control-teal',
                },
                {
                    title: 'blue',
                    colorId: 'color-control-blue',
                },
                {
                    title: 'navy',
                    colorId: 'color-control-navy',
                },
                {
                    title: 'purple',
                    colorId: 'color-control-purple',
                },
            ],
        };
        //Object.freeze(['pink', 'red', 'orange', 'brown', 'yellow', 'green', 'teal', 'blue', 'navy', 'purple']);
        currentBingomode: string = 'invasion';
        markerRedirects: [string, string][] = [];
        alwaysShowMarkers: boolean = false;

        get bingoboardModeRep(): BingoboardMode {
            return store.state.bingoboardMode;
        }

        @Watch('bingoboardModeRep', { immediate: true })
        reset(): void {
            this.currentBingomode = store.state.bingoboardMode.boardMode;
            this.markerRedirects = clone(store.state.bingoboardMode.markerRedirects);
            this.alwaysShowMarkers = store.state.bingoboardMode.alwaysShowMarkers;
        }

        update(): void {
            nodecg.sendMessage('bingomode:setBingoboardMode', {
                boardMode: this.currentBingomode,
                markerRedirects: this.markerRedirects,
                alwaysShowMarkers: this.alwaysShowMarkers,
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
    /* import bingo colors */

    #color-control-pink {
        background: var(--bingo-color-pink);
    }
    #color-control-red {
        background: var(--bingo-color-red);
    }
    #color-control-orange {
        background: var(--bingo-color-orange);
    }
    #color-control-brown {
        background: var(--bingo-color-brown);
    }
    #color-control-yellow {
        background: var(--bingo-color-yellow);
    }
    #color-control-green {
        background: var(--bingo-color-green);
    }
    #color-control-teal {
        background: var(--bingo-color-teal);
    }
    #color-control-blue {
        background: var(--bingo-color-blue);
    }
    #color-control-navy {
        background: var(--bingo-color-navy);
    }
    #color-control-purple {
        background: var(--bingo-color-purple);
    }

    .override {
        width: 100%;
        align-items: center;
    }

    #fromToColor {
        margin-left: 5px;
        margin-right: 5px;
        background: #485264;
        padding: 5px;
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
