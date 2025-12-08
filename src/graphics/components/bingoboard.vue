<template>
    <div ref="bingoboard" class="BingoBoard">
        <table class="bingo-table" :style="`--row-count: ${rowCount}; --column-count: ${columnCount};`">
            <tbody ref="tableBody">
                <tr :key="i" v-for="(column, i) in bingoCells">
                    <td class="square" :id="'tile-' + i + '-' + j" :key="i + '' + j" v-for="(cell, j) in column">
                        <div
                            :key="color.color"
                            v-for="color in cell.colors"
                            :class="'bg-color ' + color.color + 'square'"
                            :style="`background-color: ${color.color}; ${color.style}`"
                        />
                        <div class="shadow" />
                        <div :class="getMarkerClasses(marker, k)" :key="k" v-for="(marker, k) in cell.markers" />
                        <div class="CellTextFitContainer">
                            <CellTextFit :text="cell.name" :fontSize="fontSize"></CellTextFit>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="bingo-board-hide" :hidden="!boardHidden">
            <p id="soon">Bingo Board will be revealed soon&trade;</p>
        </div>
        <!-- 3D Cube Structure -->
        <div ref="cube" class="cube" id="cube" :style="`display: ${isCubeVisible ? 'block' : 'none'}`">
            <div class="face front">B</div>
            <div class="face back">O</div>
            <div class="face left">N</div>
            <div class="face right">G</div>
            <div class="face top">I</div>
            <div class="face bottom">5</div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Prop, Component } from 'vue-property-decorator';
    import { BingoBoardAnimation } from './bingoboard-animation';
    import { Bingoboard } from '../../../schemas';
    import { store } from '../../browser-util/state';
    import CellTextFit from '../helpers/cell-text-fit.vue';

    interface BingoCell {
        name: string;
        rawColors: string;
        markers?: string[];
        colors: {
            color: string;
            style: string;
        }[];
    }

    const translatePercent = {
        2: ['0', '0'],
        3: ['0', '36', '-34'],
        4: ['0', '46', '0', '-48'],
        5: ['0', '56', '18', '-18', '-56'],
        6: ['0', '60', '30', '0', '-30', '-60'],
        7: ['0', '64', '38', '13', '-13', '-38', '-64'],
        8: ['0', '64', '41', '20', '0', '-21', '-41', '-64'],
        9: ['0', '66', '45', '27', '9', '-9', '-27', '-45', '-66'],
        10: ['0', '68', '51', '34', '17', '0', '-17', '-34', '-51', '-68']
    };

    const ORDERED_COLORS = [
        'pink',
        'red',
        'orange',
        'brown',
        'yellow',
        'green',
        'teal',
        'blue',
        'navy',
        'purple'
    ].reverse();

    function sortColors(colors: string[] | string): string[] {
        var orderedColors = [];
        for (var i = 0; i < ORDERED_COLORS.length; i++) {
            if (colors.indexOf(ORDERED_COLORS[i]) !== -1) {
                orderedColors.push(ORDERED_COLORS[i]);
            }
        }
        if (Array.isArray(colors)) {
            colors.forEach((color) => {
                if (!orderedColors.includes(color)) {
                    orderedColors.push(color);
                }
            });
        }
        return orderedColors;
    }

    const colorToGradient = {
        green: '#31D814',
        red: '#FF4944',
        orange: '#FF9C12',
        blue: '#409CFF',
        purple: '#822dbf',
        pink: '#ed86aa',
        brown: '#ab5c23',
        teal: '#419695',
        navy: '#0d48b5',
        yellow: '#d8d014'
    };

    function defaultBingoBoard(): BingoCell[][] {
        var result = [];
        for (let i = 0; i < 5; i++) {
            var cur: BingoCell[] = [];
            for (let j = 0; j < 5; j++) {
                cur.push({ name: '', colors: [], rawColors: 'blank' });
            }
            result.push(cur);
        }
        return result;
    }

    function colorsToTransforms(colorsIn: string[], skewAngle: number): { color: string; style: string }[] {
        if (colorsIn.length !== 0) {
            const colors = sortColors(colorsIn);
            var newColors = [];
            newColors.push({ color: colors[0], style: '' });
            var translations = translatePercent[colors.length];
            for (var i = 1; i < colors.length; i++) {
                // how bingosync handles the backgrounds, set style here to simply bind it to html later
                newColors.push({
                    color: colors[i],
                    style: `transform: skew(-${skewAngle}rad) translateX(${translations[i]}%); border-right: solid 1.5px #444444`
                });
            }
            return newColors;
        } else {
            return [];
        }
    }

    @Component({
        components: {
            CellTextFit
        }
    })
    export default class BingoBoard extends BingoBoardAnimation {
        bingoCells: BingoCell[][] = defaultBingoBoard();
        defaultBoard: BingoCell[][] = defaultBingoBoard();

        @Prop({ default: '10px' })
        fontSize: string;
        skewAngle = 1;
        @Prop({ default: null })
        bingoboardRep: string | null;
        @Prop({ default: false })
        alwaysShown: boolean;
        // function to call when to drop the watch for the bingoboard, used to change boards
        bingoboardWatch: () => void;

        splashActivated: string = '';
        bingoAnimColor: string = 'black';

        mounted() {
            const height = this.$el.scrollHeight;
            const width = this.$el.scrollWidth;
            this.skewAngle = Math.atan(width / height);
            // no specific bingoboardRep means use the replicant
            if (this.bingoboardRep == null) {
                store.watch(
                    (state) => state.currentMainBingoboard,
                    (newBoard) => {
                        if (this.bingoboardWatch) {
                            this.bingoboardWatch();
                            this.bingoboardWatch = null;
                        }
                        this.bingoboardWatch = store.watch(
                            (state) => state[newBoard.boardReplicant],
                            this.onBingoBoardUpdate,
                            { immediate: true }
                        );
                    },
                    { immediate: true }
                );
            } else {
                // got a specific one, watch it
                this.bingoboardWatch = store.watch((state) => state[this.bingoboardRep], this.onBingoBoardUpdate, {
                    immediate: true
                });
                this.onBingoBoardUpdate(store.state[this.bingoboardRep]);
            }
            nodecg.listenFor('showBingoAnimation', 'bingothon-layouts', this.showBingoSplash);
        }

        destroyed() {
            nodecg.unlisten('showBingoAnimation', 'bingothon-layouts', this.showBingoSplash);
        }

        showBingoSplash(data: { color?: string }) {
            // if the animation is currently running do nothing
            if (this.splashActivated != '') return;
            this.bingoAnimColor = colorToGradient[data.color] || 'black';
            this.splashActivated = 'activated';
            setTimeout(() => (this.splashActivated = ''), 4000);
        }

        get boardHidden(): boolean {
            return store.state.bingoboardMeta.boardHidden && !this.alwaysShown;
        }

        onBingoBoardUpdate(newGoals: Bingoboard) {
            if (!newGoals) return;
            this.bingoCells = newGoals.cells.map((row) =>
                row.map((cell) => ({
                    name: cell.name,
                    markers: cell.markers,
                    rawColors: cell.rawColors,
                    colors: colorsToTransforms(cell.colors, this.skewAngle)
                }))
            );
            this.rowCount = newGoals.cells.length;
            this.columnCount = newGoals.cells[0]?.length ?? 5;
        }

        getMarkerClasses(marker: string, markerIndex: number): string {
            if (!marker) {
                return '';
            } else {
                return `marker marker${markerIndex} ${marker}square`;
            }
        }
    }
</script>

<style src="./bingoboard.css"></style>
