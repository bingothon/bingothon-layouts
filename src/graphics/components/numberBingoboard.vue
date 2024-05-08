<template>
    <div class="BingoBoard">
        <table class="bingo-table">
            <tbody>
                <tr :key="i" v-for="(column, i) in bingoCells">
                    <td class="square" :key="i + '' + j" v-for="(cell, j) in column">
                        <div
                            :key="color.name"
                            v-for="color in cell.colors"
                            :class="'bg-color ' + color.color + 'square'"
                            :style="color.style"
                        ></div>
                        <div class="shadow"></div>
                        <div :class="getMarkerClasses(marker, k)" :key="k" v-for="(marker, k) in cell.markers"></div>
                        <div class="CellTextFitContainer">
                            <CellTextFit :text="cell.name" :fontSize="fontSize" />
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="bingo-board-hide" :hidden="!boardHidden">
            <p id="soon">Bingo Board will be revealed soon&trade;</p>
            <!--<tbody>
			  <tr :key="i" v-for="(column,i) in defaultBoard">
				  <td class="square" :key="i+''+j" v-for="(cell,j) in column">
					  <div :key="color.name" v-for="color in cell.colors" :class="'bg-color '+color.color+'square'" :style="color.style"></div>
					  <div class="shadow"></div>
					  <div class="CellTextFitContainer">
						  <CellTextFit :text="cell.name" :fontSize="fontSize"/>
					  </div>
				  </td>
			  </tr>
		  </tbody>-->
        </div>
        <!-- disabled cause it doesn't work properly
      <div class="bingo-splash" :style="{color: bingoAnimColor}" :class="splashActivated">BINGO!</div>-->
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { nodecg } from '../../browser-util/nodecg';
    import { Bingoboard } from '../../../schemas';
    import equals from 'deep-equal';
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
    // used from bingosync
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

    function sortColors(colors: string[]): string[] {
        var orderedColors = [];
        for (var i = 0; i < ORDERED_COLORS.length; i++) {
            if (colors.indexOf(ORDERED_COLORS[i]) !== -1) {
                orderedColors.push(ORDERED_COLORS[i]);
            }
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

    @Component({
        components: {
            CellTextFit
        }
    })
    export default class BingoBoard extends Vue {
        bingoCells: BingoCell[][] = defaultBingoBoard();
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

        onBingoBoardUpdate(newGoals: Bingoboard, oldGoals?: Bingoboard | undefined) {
            if (!newGoals) return;
            let idx = 0;
            this.bingoCells.forEach((row, rowIndex) => {
                row.forEach((cell, columnIndex) => {
                    // update cell with goal name, if changed
                    const newCell = newGoals.cells[idx];
                    if (!oldGoals || !oldGoals.cells.length || newCell.name != oldGoals.cells[idx].name) {
                        Vue.set(this.bingoCells[rowIndex][columnIndex], 'name', newCell.name);
                    }
                    // update cell with color backgrounds, if changed
                    if (!oldGoals || !oldGoals.cells.length || !equals(newCell.colors, oldGoals.cells[idx].colors)) {
                        if (newCell.colors.length !== 0) {
                            const colors = sortColors(newCell.colors);
                            console.log(colors);
                            var newColors = [];
                            newColors.push({ color: colors[0], style: '' });
                            var translations = translatePercent[colors.length];
                            for (var i = 1; i < colors.length; i++) {
                                // how bingosync handles the backgrounds, set style here to simply bind it to html later
                                newColors.push({
                                    color: colors[i],
                                    style: `transform: skew(-${this.skewAngle}rad) translateX(${translations[i]}%); border-right: solid 1.5px #444444`
                                });
                            }
                            Vue.set(this.bingoCells[rowIndex][columnIndex], 'colors', newColors);
                        } else {
                            Vue.set(this.bingoCells[rowIndex][columnIndex], 'colors', []);
                        }
                    }
                    if (!oldGoals || !oldGoals.cells.length || !equals(newCell.markers, oldGoals.cells[idx].markers)) {
                        Vue.set(this.bingoCells[rowIndex][columnIndex], 'markers', newCell.markers);
                    }
                    idx++;
                });
            });
        }

        getMarkerClasses(marker, markerIndex): string {
            if (!marker) {
                return '';
            } else {
                return `marker marker${markerIndex} ${marker}square`;
            }
        }
    }
</script>

<style>
    @import url(./bingosync-style.css);
    table {
        width: 100%;
        height: 100%;
        position: absolute;
    }

    @keyframes bingo-splash {
        0% {
            opacity: 0;
            font-size: 1px;
        }
        40% {
            transform: rotate(1800deg);
            opacity: 1;
            font-size: 100px;
            text-shadow: -5px -5px 10px white, 5px -5px 10px white, -5px 5px 10px white, 5px 5px 10px white;
        }
        70% {
            transform: rotate(1800deg);
            opacity: 1;
            font-size: 100px;
            text-shadow: -5px -5px 10px white, 5px -5px 10px white, -5px 5px 10px white, 5px 5px 10px white;
        }
        100% {
            transform: rotate(1800deg) translateY(30%);
            opacity: 0;
            font-size: 90px;
            text-shadow: -5px -5px 50px white, 5px -5px 50px white, -5px 5px 50px white, 5px 5px 50px white;
        }
    }

    .bingo-board-hide {
        width: 100%;
        height: 100%;
        background: black;
        position: absolute;
        color: white;
        align-content: center;
        justify-content: center;
        font-size: 45px;
        text-align: center;
        align-items: center;
    }

    #soon {
        margin: 0;
        position: absolute;
        top: 50%;
        -ms-transform: translateY(-50%);
        transform: translateY(-50%);
    }

    .bingo-splash {
        position: absolute;
        opacity: 0;
    }

    .bingo-splash.activated {
        animation: bingo-splash 4s;
    }

    .square .bg-color,
    .square .shadow {
        width: 100%;
        height: 100%;
        /*Remove padding cause the board is kinda small*/
        padding: 0;
        border: 0;
        left: 0;
        right: 0;
    }

    .square {
        padding: 0;
        height: 20%;
        width: 20%;
        border: 2px black solid;
    }

    .text-container {
        left: 0px;
        right: 0px;
    }
    .bingo-table {
        border-collapse: collapse;
    }
    .text-span {
        left: 0px;
        right: 0px;
        top: 50%;
        transform: translateY(-50%);
    }
    .CellTextFitContainer {
        height: calc(100% - 4px);
        width: calc(100% - 4px);
        position: absolute;
        margin: 2px;
    }
    .marker {
        position: absolute;
        width: 20px;
        height: 20px;
        opacity: 0.9;
        border: 3px #0009 solid;
        border-radius: 50%;
    }
    .marker0 {
        left: 10%;
        top: 10%;
    }
    .marker1 {
        right: 10%;
        top: 10%;
    }
    .marker2 {
        left: 10%;
        bottom: 10%;
    }
    .marker3 {
        right: 10%;
        bottom: 10%;
    }
</style>
