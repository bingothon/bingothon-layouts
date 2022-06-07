<template>
    <div class="FlexContainer TeamInfoBox"
         :style="{'height' : height}"
         :class="{'ReverseOrder':reverseOrder}"
    >
        <div
            v-if="bingoColorShown"
            class="BingoColor FlexContainer"
            :class="`bingo-${bingoColor}`"
            :style="{'height' : height, 'width' : height}"
        >
            <span v-if="bingoCountShown">{{ bingoGoalCount }}</span>
        </div>
        <div :class="medalClasses"></div>
        <div class="TeamNameContainer">
            <text-fit :text="`${finishTime} ${name || ''}`" :align="reverseOrder?'right':'left'">
            </text-fit>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {RunDataTeam} from "../../../speedcontrol-types";
import {store} from "../../browser-util/state";
import TextFit from "../helpers/text-fit.vue";

@Component({
    components: {
        TextFit,
    }
})
export default class TeamInfo extends Vue {
    @Prop({required: true})
    teamIndex: number;

    @Prop({default: true})
    showFlag: boolean;

    @Prop({default: true})
    showColor: boolean;

    @Prop({default: "55px"})
    height: string;

    @Prop({default: false})
    reverseOrder: boolean;

    get name(): string {
        const team = store.state.runDataActiveRun.teams[this.teamIndex];
        if (!team) {
            return "";
        }
        return team.name;
    }

    get playerIndex(): number {
        const team = store.state.runDataActiveRun.teams[this.teamIndex];
        if (!team) {
            return -1;
        }
        var idx = 0;
        for (let i = 0; i < this.teamIndex; i++) {
            idx += store.state.runDataActiveRun.teams[i].players.length;
        }
        return idx;
    }

    get bingoColor(): string {
        return store.state.bingoboardMeta.playerColors[this.playerIndex * 2] || "red";
    }

    get bingoGoalCount(): number {
        const bingoboard = store.state[store.state.currentMainBingoboard.boardReplicant];
        if (!store.state.bingoboardMeta.manualScoreOverride) {
            return <number>bingoboard.colorCounts[store.state.bingoboardMeta.playerColors[this.playerIndex * 2] || "red"];
        } else {
            return store.state.bingoboardMeta.manualScores[this.playerIndex * 2];
        }
    }

    get bingoColorShown(): boolean {
        return store.state.bingoboardMeta.colorShown && this.showColor;
    }

    get bingoCountShown(): boolean {
        return store.state.bingoboardMeta.countShown;
    }

    get finishTime(): string {
        // no individual finish time for one team runs
        // also disable for lockout
        if (store.state.runDataActiveRun.teams.length == 1) {
            return '';
        }
        // get the team this player belongs to
        const teamID = store.state.runDataActiveRun.teams[this.teamIndex].id;
        if (teamID) {
            const finishTime = store.state.timer.teamFinishTimes[teamID];
            if (finishTime) {
                // disable time if lockout, but still "change" it, to force a refit
                if (store.state.runDataActiveRun.customData.Bingotype?.includes("lockout")) {
                    return ' ';
                } else {
                    return `[${finishTime.time}] `;
                }
            }
        }
        return '';
    }

    get medalClasses(): string {
        // no individual finish time for one team runs
        // also this is disabled for some layouts
        if (store.state.runDataActiveRun.teams.length == 1) {
            return '';
        }
        // get the team this player belongs to
        const teamID = store.state.runDataActiveRun.teams[this.teamIndex].id;
        if (teamID) {
            const finishTime = store.state.timer.teamFinishTimes[teamID];
            if (finishTime) {
                let place = 1;
                Object.values(store.state.timer.teamFinishTimes).forEach(time => {
                    if (time.milliseconds < finishTime.milliseconds) {
                        place++;
                    }
                });
                let medalColor = null;
                switch (place) {
                    case 1:
                        medalColor = 'gold';
                        break;
                    case 2:
                        medalColor = 'silver';
                        break;
                    case 3:
                        medalColor = 'bronze';
                        break;
                }
                if (medalColor) {
                    return `medal shine medal-${medalColor}`;
                }
            }
        }
        return '';
    }
}
</script>

<style>
@import './medals.css';

.TeamInfoBox {
    color: var(--font-color);
    padding: 7px;
    font-size: 35px;
    height: 60px;
}

.TeamInfoBox.ReverseOrder {
    flex-direction: row-reverse;
}

.TeamInfoBox > .TeamNameContainer {
    flex-grow: 1;
    flex-shrink: 0;
    height: 100%;
    position: relative;
    white-space: nowrap;
    justify-content: left;
}

.TeamInfoBox > .BingoColor {
    justify-content: center;
    height: 55px;
    width: 55px;
    margin-right: 20px;
    font-size: 40px;
    border-radius: 10%;
    border: 1px white solid;
}

/* Bingosync styled gradients */
.TeamInfoBox > .BingoColor.bingo-green {
    background-image: var(--bingo-color-green);
}

.TeamInfoBox > .BingoColor.bingo-red {
    background-image: var(--bingo-color-red);
}

.TeamInfoBox > .BingoColor.bingo-orange {
    background-image: var(--bingo-color-orange);
}

.TeamInfoBox > .BingoColor.bingo-blue {
    background-image: var(--bingo-color-blue);
}

.TeamInfoBox > .BingoColor.bingo-purple {
    background-image: var(--bingo-color-purple);
}

.TeamInfoBox > .BingoColor.bingo-pink {
    background-image: var(--bingo-color-pink);
}

.TeamInfoBox > .BingoColor.bingo-brown {
    background-image: var(--bingo-color-brown);
}

.TeamInfoBox > .BingoColor.bingo-teal {
    background-image: var(--bingo-color-teal);
}

.TeamInfoBox > .BingoColor.bingo-navy {
    background-image: var(--bingo-color-navy);
}

.TeamInfoBox > .BingoColor.bingo-yellow {
    background-image: var(--bingo-color-yellow);
}
</style>
