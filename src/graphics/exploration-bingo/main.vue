<template>
    <div id="ExplorationBingo" :style="`--row-count: ${rowCount}; --column-count: ${columnCount};`">
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

        columnCount: number = 5;
        rowCount: number = 5;

        mounted() {
            console.log(this.bingoCells);
            store.watch((state) => state.explorationBingoboard, this.onBingoBoardUpdate, { immediate: true });
        }

        onBingoBoardUpdate(newGoals: ExplorationBingoboard, oldGoals?: ExplorationBingoboard | undefined) {
            if (!newGoals) return;
            this.bingoCells = newGoals.cells.map((row, rowindex) => row.map((cell, columnindex) => ({
                name: cell.name,
                hidden: cell.hidden,
                colors: cell.colors.at(0) ?? 'blank',
                row: rowindex,
                column: columnindex,
            })));
            this.rowCount = newGoals.cells.length;
            this.columnCount = newGoals.cells[0]?.length ?? 5;
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
                        row: cell.row,
                        column: cell.column
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
        height: calc(100% / var(--row-count));
        width: calc(100% / var(--column-count));
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
