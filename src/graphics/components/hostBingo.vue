<template>
    <div class="BingoBoard">
        <table class="bingo-table">
            <tbody>
                <tr :key="i" v-for="(column, i) in bingoCells">
                    <td
                        class="square"
                        :key="i + '' + j"
                        v-for="(cell, j) in column"
                        v-on:click="updateCell(cell, i, j)"
                        :title="cell.description"
                    >
                        <div v-if="cell.marked" class="bg-color marked" />
                        <div class="shadow" />
                        <div class="CellTextFitContainer">
                            <CellTextFit :text="cell.goal" :fontSize="fontSize"></CellTextFit>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <button v-if="dashboard" id="btn" v-on:click="resetBoard()">Reset</button>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { HostBingoCell } from '../../../schemas';
    import { getReplicant, store } from '../../browser-util/state';
    import CellTextFit from '../helpers/cell-text-fit.vue';

    const goals = require('../../../static/hostBingo.json');

    function toColumns(goals: HostBingoCell[]): HostBingoCell[][] {
        console.log(goals);
        let result = [];
        for (let i = 0; i < 5; i++) {
            let cur: HostBingoCell[] = [];
            for (let j = 0; j < 5; j++) {
                let goal = goals[i * 5 + j];
                cur.push({ ...goal, marked: false });
            }
            result.push(cur);
        }
        console.log(result);
        return result;
    }

    @Component({
        components: {
            CellTextFit,
        },
    })
    export default class HostBingoComponent extends Vue {
        @Prop({ default: '10px' })
        fontSize: string;

        @Prop({ default: false })
        dashboard: boolean;

        skewAngle = 1;

        resetBoard() {
            getReplicant<HostBingoCell[][]>('hostingBingoboard').value = toColumns(goals);
        }

        get bingoCells(): HostBingoCell[][] {
            return store.state.hostingBingoboard;
        }

        mounted() {
            const height = this.$el.scrollHeight;
            const width = this.$el.scrollWidth;
            this.skewAngle = Math.atan(width / height);

            getReplicant<HostBingoCell[][]>('hostingBingoboard').on('assignmentRejected', (rejectReason) => {
                console.log('assignment rejected');
                console.log(rejectReason);
            });
        }

        updateCell(cell: HostBingoCell, col: number, row: number) {
            getReplicant<HostBingoCell[][]>('hostingBingoboard').value[col][row] = {
                goal: cell.goal,
                description: cell.description,
                marked: !cell.marked,
            };
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

    .marked {
        background-color: var(--darker-main-color);
    }

    #btn {
        position: absolute;
        top: 500px;
    }
</style>
