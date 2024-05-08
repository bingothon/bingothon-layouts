<template>
    <div id="ExplorationBingo">
        <table id="Board">
            <tr :key="i" v-for="(column, i) in bingoCells">
                <td
                    class="square"
                    :class="cell.colors + 'square' + (cell.hidden ? '' : ' shown')"
                    :key="i + '' + j"
                    v-for="(cell, j) in column"
                    @click="squareClicked(cell)"
                >
                    {{ cell.name }}
                </td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { store } from '../../browser-util/state';
    import { ExplorationBingoboard } from '../../../schemas';

    interface BingoCell {
        name: string;
        hidden: boolean;
        colors: string;
        row: number;
        column: number;
    }

    function defaultBingoBoard(): BingoCell[][] {
        var result = [];
        for (let i = 0; i < 5; i++) {
            var cur: BingoCell[] = [];
            for (let j = 0; j < 5; j++) {
                cur.push({ name: '', colors: 'blank', row: i, column: j, hidden: true });
            }
            result.push(cur);
        }
        return result;
    }

    @Component({})
    export default class ExplorationBingo extends Vue {
        bingoCells: BingoCell[][] = defaultBingoBoard();

        mounted() {
            console.log(this.bingoCells);
            store.watch((state) => state.explorationBingoboard, this.onBingoBoardUpdate, { immediate: true });
        }

        onBingoBoardUpdate(newGoals: ExplorationBingoboard, oldGoals?: ExplorationBingoboard | undefined) {
            let idx = 0;
            this.bingoCells.forEach((row, rowIndex) => {
                row.forEach((cell, columnIndex) => {
                    // update cell with goal name, if changed
                    const newCell = newGoals.cells[idx];
                    if (!oldGoals || !oldGoals.cells.length || newCell.name != oldGoals.cells[idx].name) {
                        Vue.set(this.bingoCells[rowIndex][columnIndex], 'name', newCell.name);
                    }
                    // update cell with color background, if changed
                    if (!oldGoals || !oldGoals.cells.length || newCell.colors != oldGoals.cells[idx].colors) {
                        Vue.set(this.bingoCells[rowIndex][columnIndex], 'colors', newCell.colors);
                    }
                    Vue.set(this.bingoCells[rowIndex][columnIndex], 'hidden', newCell.hidden);
                    idx++;
                });
            });
        }

        generateCellClasses(color: string, hidden: boolean): string {
            let classes = color + 'square';
            if (!hidden) {
                classes = classes + ' shown';
            }
            return classes;
        }

        squareClicked(cell: BingoCell) {
            if (!cell.hidden) {
                nodecg
                    .sendMessageToBundle('exploration:goalClicked', 'bingothon-layouts', {
                        index: cell.row * 5 + cell.column
                    })
                    .catch((e) => {
                        console.error(e);
                    });
            }
        }
    }
</script>

<style>
    body {
        /*height: 100%;
		width: 100%;
		background-color: black;*/
    }

    table#Board {
        height: 800px;
        width: 800px;
        border-collapse: collapse;
    }

    .square {
        padding: 0;
        height: 20%;
        width: 20%;
        border: 2px black solid;
    }

    .square.shown {
        cursor: pointer;
    }

    .greensquare {
        background-image: linear-gradient(#31d814, #00b500 60%, #20a00a);
    }

    .redsquare {
        background-image: linear-gradient(#ff4944, #da4440 60%, #ce302c);
    }

    .orangesquare {
        background-image: linear-gradient(#ff9c12, #f98e1e 60%, #d0800f);
    }

    .bluesquare {
        background-image: linear-gradient(#409cff, #37a1de 60%, #088cbd);
    }

    .purplesquare {
        background-image: linear-gradient(#822dbf, #7120ab);
    }

    .pinksquare {
        background-image: linear-gradient(#ed86aa, #cc6e8f);
    }

    .brownsquare {
        background-image: linear-gradient(#ab5c23, #6d3811);
    }

    .tealsquare {
        background-image: linear-gradient(#419695, #2e7372);
    }

    .navysquare {
        background-image: linear-gradient(#0d48b5, #022b75);
    }

    .yellowsquare {
        background-image: linear-gradient(#d8d014, #c1ba0b);
    }
</style>
