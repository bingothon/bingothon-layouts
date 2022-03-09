<!-- This component handles displays each player's information within a team. -->
<!-- This is added dynamically to the PlayerContainer component when we need to show this. -->
<!-- It is initialised with most info, it only listens to nodecg-speedcontrol for finish times. -->

<template>
    <div
        class="FlexContainer PlayerInfoBox"
        :class="{'ReverseOrder':reverseOrder}"
        :style="{'height':height}"
    >
        <div class="CurrentIcon FlexContainer"
             :style="{ 'width' : `calc(${height} * 1.5)` }"
        >
            <transition name="fade">
                <div class="PronounsContainer" v-if="show && pronouns" key="pronuns">
                    <text-fit :text="pronouns"></text-fit>
                </div>
                <img
                    v-else
                    :key="currentIcon"
                    :src="currentIcon"
                >
            </transition>
        </div>
        <div :class="medalClasses"></div>
        <div class="PlayerName">
            <transition name="fade">
                <text-fit :key="text" :text="finishTime+text" :align="reverseOrder?'right':'left'">
                </text-fit>
            </transition>
        </div>
        <div v-if="showSound"
             class="Sound"
        >
            <img :src="'/bundles/bingothon-layouts/static/music-note.png'">
        </div>
        <div v-if="!!player.country"
             class="Flag FlexContainer"
             :style="{'width' : `calc(${height} * 1.9)`}"
        >
            <transition name="fade">
                <img
                    :key="player.country"
                    :style="{ 'visibility' : showFlag ? 'visbile' : 'hidden' }"
                    :src="getPlayerFlag(player.country)"
                >
            </transition>
        </div>
        <div
            v-if="bingoColorShown === true"
            class="BingoColor FlexContainer"
            :class="`bingo-${bingoColor}`"
            :style="{ 'width' : height * 0.75, 'height': (height * 0.75) }"
        >
            <span v-if="bingoCountShown === true">{{ bingoGoalCount }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {store} from "../../browser-util/state";
import {RunDataPlayer} from "../../../speedcontrol-types";
import TextFit from "../helpers/text-fit.vue";

const playerSoloImg = require('../_misc/player-solo.png');
const twitchIconImg = require('../_misc/twitch-icon.png');

@Component({
    components: {
        TextFit,
    }
})
export default class PlayerInfo extends Vue {
    @Prop({default: -1})
    playerIndex: number;

    @Prop({default: true})
    showFlag: boolean;

    @Prop({default: true})
    showColor: boolean;

    @Prop({default: "55px"})
    height: string;

    @Prop({default: false})
    reverseOrder: boolean;

    @Prop({default: false})
    hideSoundIcon: boolean;

    @Prop({default: false})
    hideFinishTime: boolean;

    get player(): RunDataPlayer {
        let idx = 0;
        let correctPlayer;
        for (let i = 0; i < store.state.runDataActiveRun.teams.length; i++) {
            const team = store.state.runDataActiveRun.teams[i];
            for (let j = 0; j < team.players.length; j++) {
                if (idx == this.playerIndex) {
                    correctPlayer = team.players[j];
                    // break out of both loops
                    i = 100;
                    break;
                }
                idx++;
            }
        }
        if (!correctPlayer) {
            return {
                name: "test2",
                id: "-1",
                teamID: "-1",
                country: "eu",
                social: {
                    twitch: ""
                },
                customData: {
                    pronouns: "they/them",
                },
            };
        }
        return correctPlayer;
    }

    get show(): boolean {
        return store.state.playerAlternate;
        // return true;
    }

    get currentIcon(): any {
        if (this.show) {
            return playerSoloImg;
        } else {
            return twitchIconImg;
        }
    }

    get text(): string {
        if (this.show) {
            return this.player.name;
        } else {
            return "/" + this.player.social.twitch;
        }
    }

    get pronouns(): string {
        return this.player.pronouns || '';
    }

    get finishTime(): string {
        // no individual finish time for one team runs
        // also this is disabled for some layouts
        if (this.hideFinishTime
            || store.state.runDataActiveRun.teams.length == 1) {
            return '';
        }
        // get the team this player belongs to
        if (this.teamID) {
            const finishTime = store.state.timer.teamFinishTimes[this.teamID];
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

    get teamID(): string | null {
        let theTeamID = null;
        let playerNum = 0;
        store.state.runDataActiveRun.teams.forEach(t => {
            t.players.forEach(p => {
                if (playerNum == this.playerIndex) {
                    theTeamID = t.id;
                }
                playerNum++;
            });
        });
        return theTeamID;
    }

    get bingoColor(): string {
        return store.state.bingoboardMeta.playerColors[this.playerIndex] || "red";
    }

    get bingoGoalCount(): number {
        const bingoboard = store.state[store.state.currentMainBingoboard.boardReplicant];
        if (!store.state.bingoboardMeta.manualScoreOverride) {
            return <number>bingoboard.colorCounts[store.state.bingoboardMeta.playerColors[this.playerIndex] || "red"];
        } else {
            return store.state.bingoboardMeta.manualScores[this.playerIndex];
        }
    }

    get bingoColorShown(): boolean {
        return store.state.bingoboardMeta.colorShown && this.showColor;
    }

    get bingoCountShown(): boolean {
        return store.state.bingoboardMeta.countShown;
    }

    get showSound(): boolean {
        return this.playerIndex == store.state.soundOnTwitchStream && !this.hideSoundIcon;
    }

    get medalClasses(): string {
        // no individual finish time for one team runs
        // also this is disabled for some layouts
        if (this.hideFinishTime || store.state.runDataActiveRun.teams.length == 1) {
            return '';
        }
        // get the team this player belongs to
        if (this.teamID) {
            const finishTime = store.state.timer.teamFinishTimes[this.teamID];
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

    getPlayerFlag(rawFlag: string | undefined): string {
        return `/bundles/bingothon-layouts/static/flags/${rawFlag}.png`
    }
}
</script>

<style>
@import './medals.css';

.PlayerInfoBox {
    /*Summer background-image: linear-gradient(var(--lighter-main-color), var(--darker-main-color));*/
    background-image: linear-gradient(var(--alternative-main-color), var(--darker-main-color));;
    color: var(--font-color);
    padding: 7px;
    font-weight: 500;
    font-size: 30px;
}

.PlayerInfoBox.ReverseOrder {
    flex-direction: row-reverse;
}

.PlayerInfoBox > .CurrentIcon {
    height: 100%;
    text-align: left;
    position: relative;
}

.PlayerInfoBox > .CurrentIcon > img {
    height: 100%;
    position: absolute;
    filter: invert(1);
}

.PlayerInfoBox > .CurrentIcon > .PronounsContainer {
    font-size: 60%;
    /* color: #f3ad00; */
    /* border: 1px solid #f3ad00; */
    /* background-color: #f3ad00; */
    bottom: 1px;
    color: white;
    height: 75%;
    position: absolute;
    width: 70px;
}

.PlayerInfoBox > .PlayerName {
    flex-grow: 1;
    flex-shrink: 0;
    height: 100%;
    margin-left: 10px;
    margin-right: 10px;
    justify-content: flex-start;
    position: relative;
}

/*.PlayerInfoBox > .PlayerName > div > .FinishTime {
  color: var(--font-colour);
}*/

.PlayerInfoBox > .Flag {
    height: 100%;
    justify-content: flex-end;
    position: relative;
    margin-right: 15px;
}

.PlayerInfoBox.ReverseOrder > .Flag {
    justify-content: flex-start;
}

.PlayerInfoBox > .Flag > img {
    visibility: visible;
    position: absolute;
    border: 1px solid white;
    height: calc(100% - 2px);
}

.PlayerInfoBox > .BingoColor {
    justify-content: center;
    margin-left: 14px;
    font-size: 40px;
    border-radius: 10%;
    border: 1px white solid;
    box-sizing: content-box;
}

.PlayerInfoBox > .Sound > img {
    width: 30px;
}

/* Bingosync styled gradients */
.PlayerInfoBox > .BingoColor.bingo-green {
    background-image: var(--bingo-color-green);
}

.PlayerInfoBox > .BingoColor.bingo-red {
    background-image: var(--bingo-color-red);
}

.PlayerInfoBox > .BingoColor.bingo-orange {
    background-image: var(--bingo-color-orange);
}

.PlayerInfoBox > .BingoColor.bingo-blue {
    background-image: var(--bingo-color-blue);
}

.PlayerInfoBox > .BingoColor.bingo-purple {
    background-image: var(--bingo-color-purple);
}

.PlayerInfoBox > .BingoColor.bingo-pink {
    background-image: var(--bingo-color-pink);
}

.PlayerInfoBox > .BingoColor.bingo-brown {
    background-image: var(--bingo-color-brown);
}

.PlayerInfoBox > .BingoColor.bingo-teal {
    background-image: var(--bingo-color-teal);
}

.PlayerInfoBox > .BingoColor.bingo-navy {
    background-image: var(--bingo-color-navy);
}

.PlayerInfoBox > .BingoColor.bingo-yellow {
    background-image: var(--bingo-color-yellow);
}
</style>
