<template>
    <div class="BingoBoard">
        <table class="bingo-table">
            <tbody>
                <tr :key="i" v-for="(column, i) in bingoCells">
                    <td
                        class="square"
                        :key="`${i} ${j}`"
                        v-for="(cell, j) in column"
                        v-on:click="updateCell(cell, i, j, true)"
                        v-on:contextmenu="
                            (e) => {
                                e.preventDefault();
                                updateCell(cell, i, j);
                            }
                        "
                        :title="cell.description"
                    >
                        <div
                            v-for="color in calculateBgColorStyles(cell)"
                            :class="'bg-color ' + color.color + 'square'"
                            :style="color.style"
                        />
                        <div class="shadow" />
                        <div class="CellTextFitContainer">
                            <CellTextFit :text="cell.goal" :fontSize="fontSize"></CellTextFit>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="dashboard" id="btn">
            <button v-on:click="resetBoard()">Reset</button>
            <div>Red = Bingothon</div>
            <div>Blue = Nitro (Restream, left click)</div>
            <div>Green = SRDE (Restream, right click)</div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { HostBingoCell } from '../../../schemas';
    import { getReplicant, store } from '../../browser-util/state';
    import CellTextFit from '../helpers/cell-text-fit.vue';

    const goals = require('../../../static/hostBingo.json');

    function toColumns(goals: HostBingoCell[]): HostBingoCell[][] {
        // console.log(goals);
        let result = [];
        for (let i = 0; i < 5; i++) {
            let cur: HostBingoCell[] = [];
            for (let j = 0; j < 5; j++) {
                let goal = goals[i * 5 + j];
                cur.push({ ...goal, marked: false, markedRestream1: false, markedRestream2: false });
            }
            result.push(cur);
        }
        // console.log(result);
        return result;
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

    @Component({
        components: {
            CellTextFit
        }
    })
    export default class HostBingoComponent extends Vue {
        @Prop({ default: '10px' })
        fontSize: string;

        @Prop({ default: false })
        dashboard: boolean;

        @Prop({ default: false })
        isRestream: boolean;

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

            getReplicant<HostBingoCell[][]>('hostingBingoboard').on('operationsRejected', (rejectReason) => {
                console.log('assignment rejected');
                console.log(rejectReason);
            });
        }

        updateCell(cell: HostBingoCell, col: number, row: number, primaryClick?: boolean) {
            if (this.isRestream) {
                if (primaryClick) {
                    getReplicant<HostBingoCell[][]>('hostingBingoboard').value[col][row] = {
                        ...cell,
                        markedRestream1: !cell.markedRestream1
                    };
                } else {
                    getReplicant<HostBingoCell[][]>('hostingBingoboard').value[col][row] = {
                        ...cell,
                        markedRestream2: !cell.markedRestream2
                    };
                }
            } else {
                getReplicant<HostBingoCell[][]>('hostingBingoboard').value[col][row] = {
                    ...cell,
                    marked: !cell.marked
                };
            }
        }

        calculateBgColorStyles(cell: HostBingoCell): { color: string; style: string }[] {
            const colors = [];
            if (cell.marked) {
                colors.push('red');
            }
            if (cell.markedRestream1) {
                colors.push('blue');
            }
            if (cell.markedRestream2) {
                colors.push('green');
            }
            const newColors = [];
            if (colors.length > 0) {
                newColors.push({ color: colors[0], style: '' });
            }
            const translations = translatePercent[colors.length];
            for (let i = 1; i < colors.length; i++) {
                // how bingosync handles the backgrounds, set style here to simply bind it to html later
                newColors.push({
                    color: colors[i],
                    style: `transform: skew(-${this.skewAngle}rad) translateX(${translations[i]}%); border-right: solid 1.5px #444444`
                });
            }
            return newColors;
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
        top: 100%;
    }
</style>
