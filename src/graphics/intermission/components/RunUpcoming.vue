<template>
    <div>
        <div class="Header">
            Coming Up
            <span v-if="!when"> Next </span>
            <span v-else>
                {{ formETAUntilRun() }}
            </span>
        </div>
        <div class="GameLayout">
            <!-- Game Cover Section -->

            <div class="GameCover">
                <!--GameCover itself can't be undefined, but it can have the text undefined...-->
                <!--Don't kill the messenger, I'm only telling you--->
                <img v-if="gameCover && gameCover !== 'undefined' && gameCover !== 'null'" :src="gameCover" />
            </div>

            <!-- Game And Players Section-->
            <div class="GameTitlePlayersContainer">
                <!-- First Half Players or Teams -->
                <div class="PlayersContainer">
                    <template v-if="isTeamGame">
                        <div v-for="(team, teamIndex) in firstHalf" :key="'first-team-' + teamIndex">
                            <div v-if="team.name" class="TeamChip FlexContainer">
                                <TextFitRelative
                                    :text="team.name"
                                    align="center"
                                    position="relative"
                                    margin="10"
                                ></TextFitRelative>
                            </div>
                            <div v-if="isTeam(team)">
                                <!-- This is the type guard -->
                                <div
                                    v-for="(player, playerIndex) in team.players"
                                    :key="playerIndex"
                                    class="PlayerChip-1 FlexContainer"
                                >
                                    <TextFitRelative
                                        :text="player.name"
                                        align="center"
                                        position="relative"
                                        margin="10"
                                    ></TextFitRelative>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div
                            v-for="(player, playerIndex) in firstHalf"
                            :key="playerIndex"
                            class="PlayerChip-1 FlexContainer"
                        >
                            <TextFitRelative
                                :text="player.name"
                                align="center"
                                position="relative"
                                margin="10"
                            ></TextFitRelative>
                        </div>
                    </template>
                </div>
                <!-- Game Title And Details -->
                <div class="GameTitleDetailsContainer">
                    <div class="GameCategoryChip" v-if="gameSystem">
                        <TextFitRelative
                            :text="gameCategory"
                            align="center"
                            position="relative"
                            margin="10"
                        ></TextFitRelative>
                    </div>
                    <!-- Game Title -->
                    <div class="GameTitle" :class="{ 'single-player': isSinglePlayer }">
                        <div class="Title" v-if="gameTitle">
                            <ScrollText :data="{ msg: gameTitle, size: 40, time: 15 }" />
                        </div>
                        <!-- Game Details Section -->
                    </div>
                    <div class="GameDetails">
                        <div class="Estimate Chip" v-if="data.estimate">
                            <span class="ChipText">{{ data.estimate }}</span>
                        </div>
                        <GameSystem class="GameSystem Chip" v-if="gameSystem" :gameSystem="gameSystem" />
                    </div>
                </div>

                <!-- Second Half Players or Teams -->
                <div class="PlayersContainer">
                    <template v-if="isTeamGame">
                        <div v-for="(team, teamIndex) in secondHalf" :key="'first-team-' + teamIndex">
                            <div v-if="team.name" class="TeamChip FlexContainer">
                                <TextFitRelative
                                    :text="team.name"
                                    align="center"
                                    position="relative"
                                    margin="10"
                                ></TextFitRelative>
                            </div>
                            <div v-if="isTeam(team)">
                                <div
                                    v-for="(player, playerIndex) in team.players"
                                    :key="playerIndex"
                                    class="PlayerChip FlexContainer"
                                >
                                    <TextFitRelative
                                        :text="player.name"
                                        align="center"
                                        position="relative"
                                        margin="10"
                                    ></TextFitRelative>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div
                            v-for="(player, playerIndex) in secondHalf"
                            :key="playerIndex"
                            class="PlayerChip FlexContainer"
                        >
                            <TextFitRelative
                                :text="player.name"
                                :fontSize="localfontSize"
                                align="center"
                                position="relative"
                                margin="10"
                            ></TextFitRelative>
                        </div>
                    </template>
                    <template v-if="isSinglePlayer">
                        <div class="PlayerPlaceHolder"></div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import GameSystem from '@/graphics/components/gameSystem.vue';
    import moment from 'moment';
    import { RunData, RunDataPlayer, RunDataTeam } from 'speedcontrol-types';
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import InlineSvg from '../../components/InlineSvg.vue';
    import TextFitRelative from '../../helpers/text-fit-relative.vue';
    import ScrollText from './Title/ScrollText.vue';

    @Component({
        components: { InlineSvg, TextFitRelative, ScrollText, GameSystem }
    })
    export default class RunUpcoming extends Vue {
        @Prop({ default: undefined })
        data: RunData;
        @Prop({ default: undefined })
        when: number;
        @Prop({ default: '22px' })
        localfontSize: string;

        pathsAndLogos: {
            [key: string]: { textNeeded: boolean; logoPath: string };
        } = require('../../_misc/consoleLogosPaths');

        get isSinglePlayer() {
            return this.players.length === 1 && !this.isTeamGame;
        }

        get gameTitle(): string {
            return this.data.game;
        }

        get gameCategory(): string {
            return this.data.category;
        }

        get gameCover(): string {
            const coverUrl = this.data.customData.gameCover;
            if (!coverUrl) {
                return '';
            }
            return coverUrl.replace('52x72', '96x144');
        }

        get isTeamGame(): boolean {
            return this.data.teams.length > 1;
        }

        get gameSystem(): string {
            return this.data.system;
        }

        isTeam(obj: RunDataPlayer | RunDataTeam): obj is RunDataTeam {
            return (obj as RunDataTeam).players !== undefined;
        }

        get players(): RunDataPlayer[] {
            let allPlayers: RunDataPlayer[] = [];

            for (let team of this.data.teams) {
                for (let player of team.players) {
                    allPlayers.push(player);
                }
            }

            return allPlayers;
        }

        get flattenedPlayersOrTeams(): RunDataTeam[] | RunDataPlayer[] {
            if (this.isTeamGame) {
                return this.data.teams;
            } else {
                return this.players;
            }
        }

        get firstHalf(): RunDataTeam[] | RunDataPlayer[] {
            let halfIndex = Math.ceil(this.flattenedPlayersOrTeams.length / 2);
            return this.flattenedPlayersOrTeams.slice(0, halfIndex);
        }

        get secondHalf(): RunDataTeam[] | RunDataPlayer[] {
            let halfIndex = Math.ceil(this.flattenedPlayersOrTeams.length / 2);
            return this.flattenedPlayersOrTeams.slice(halfIndex);
        }

        formETAUntilRun() {
            const eta = moment.utc().second(0).to(moment.utc().second(this.when), true);
            return `In about ${eta}`;
        }
    }
</script>

<style scoped>
    .GameLayout {
        display: flex;
        background-color: rgba(0, 0, 0, 0.3);
    }

    .GameCover {
        display: flex;
        flex: 1;
        max-width: 150px;
        margin-left: 15px;
        justify-content: center; /* This centers its children horizontally */
        align-items: center; /* Optional: This would vertically center the image if the .GameCover has a height larger than the image */
        min-width: 150px;
        flex-grow: 0;
        flex-shrink: 0;
    }

    .GameCover img {
        width: auto;
        max-width: 100px;
        height: auto;
        max-height: 125px;
    }

    .GameTitlePlayersContainer {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr; /* this creates 2 equal columns */
        gap: 8px; /* this is the space between the items */
        justify-content: center;
        flex-direction: column;
        align-items: center;
        flex-grow: 0;
        flex-shrink: 0;
        width: 1040px;
    }

    .GameTitle {
        position: relative;
        background-color: #7c420f; /* SHould probably make this a variable when changing next time*/
        color: #fff; /* White text */
        margin: 4px auto;
    }

    .GameTitle::before,
    .GameTitle::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 20px;
        height: 20px;
        background-color: #7c420f; /* SHould probably make this a variable when changing next time*/
        transform: translateY(-50%) rotate(45deg);
    }

    .GameTitle::before {
        left: -10px; /* Half of width */
    }

    .GameTitle::after {
        right: -10px; /* Half of width */
    }

    .GameTitle.single-player::after {
        content: none; /* This will remove the pseudo-element */
    }

    .PlayersContainer {
        display: grid;
        grid-template-columns: 150px; /* this creates 2 equal columns */
        gap: 8px; /* this is the space between the items */
        width: 145px;
        flex-grow: 0;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
    }

    .PlayerChip-1 {
        position: relative; /* Corrected from 'display' to 'position' */
        font-weight: bold;
        padding: 3px 4px;
        background-color: rgba(220, 240, 255, 0.9);
        border-radius: 2px;
        height: 32px;
        min-width: 125px;
        width: 125px;
        max-width: 125px;
        color: #333;
        border: 1px solid rgba(180, 230, 255, 0.7);
        background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="iceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(240, 255, 255, 0.7); stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(200, 240, 255, 0.9); stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23iceGradient)" /></svg>');
        box-shadow: 0px 0px 5px 2px rgba(200, 240, 255, 0.3);
        margin: 4px 4px 4px 17px;
    }

    .PlayerChip {
        position: relative; /* Corrected from 'display' to 'position' */
        font-weight: bold;
        padding: 3px 4px;
        background-color: rgba(220, 240, 255, 0.9);
        border-radius: 2px;
        height: 32px;
        min-width: 125px;
        width: 125px;
        max-width: 125px;
        color: #333;
        margin: 4px 4px 4px 5px;
        border: 1px solid rgba(180, 230, 255, 0.7);
        background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="iceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(240, 255, 255, 0.7); stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(200, 240, 255, 0.9); stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23iceGradient)" /></svg>');
        box-shadow: 0px 0px 5px 2px rgba(200, 240, 255, 0.3);
    }

    .PlayerPlaceHolder {
        background-image: url('../../../../static/snowflake.png');
        background-repeat: no-repeat;
        background-position: center center;
        background-size: cover;
        width: 95px;
        height: 92px;
        margin: 4px 4px 4px 15px;
    }

    .TeamChip {
        display: flex;
        font-weight: bold;
        padding: 3px 4px;
        background-color: var(--container-background-color);
        border-radius: 2px;
        height: 32px;
        min-width: 140px;
        width: 140px;
        max-width: 140px;
        margin: 4px;
        border: 1px solid var(--container-border-color);
        /* background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="iceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(240, 255, 255, 0.7); stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(200, 240, 255, 0.9); stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23iceGradient)" /></svg>'); */
        box-shadow: 0px 0px 5px 2px rgba(40, 74, 87, 0.247);
        color: #fff;
    }

    .joystick svg {
        width: 25px;
        height: 25px;
        margin-top: 5px;
    }

    .GameTitle {
        flex: 3;
        display: flex;
        flex-direction: column;
        align-items: center;
        /* horizontal align also center */
        justify-content: center;
        min-width: 520px;
        max-width: 520px;
        max-height: 240px;
        padding: 5px;
        flex-grow: 0;
        flex-shrink: 0;
    }

    .Title {
        font-size: 2.1rem;
        font-weight: bold;
        text-align: center;
        max-height: 64px;
        white-space: nowrap;
        width: 500px;
        overflow: hidden;
    }

    .GameDetails {
        display: flex;
        /* display: grid; */
        /* grid-template-columns: 160px 160px; this creates 2 equal columns */
        gap: 4px;
        /* flex-direction: column; */
        align-items: flex-start; /* This makes the content align to the left */
        justify-content: center;
        flex-grow: 0;
        flex-shrink: 0;
    }

    .BingoMode img {
        width: auto;
        height: 80px;
    }

    .Chip span {
        flex-grow: 1;
        text-align: center;
        font-size: 1.5rem;
    }

    .Chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: bold;
        padding: 3px 4px;
        background-color: rgba(220, 240, 255, 0.9); /* Light blueish, slightly transparent */
        border-radius: 2px;
        height: 22px;
        /* min-width: 150px; */
        color: #333;
        margin: 4px;
        border: 1px solid rgba(180, 230, 255, 0.7); /* Slightly blueish border for that 'frozen' feel */
        /* max-width: 250px; */

        /* Ice-like gradient background using SVG */
        background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="iceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(240, 255, 255, 0.7); stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(200, 240, 255, 0.9); stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23iceGradient)" /></svg>');
        box-shadow: 0px 0px 5px 2px rgba(200, 240, 255, 0.3); /* Subtle glow to add depth */
    }

    .GameCategoryChip {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: bold;
        padding: 3px 4px;
        background-color: rgba(220, 240, 255, 0.9); /* Light blueish, slightly transparent */
        border-radius: 2px;
        height: 22px;
        min-width: 520px;
        color: #333;
        margin: 4px;
        border: 1px solid rgba(180, 230, 255, 0.7); /* Slightly blueish border for that 'frozen' feel */
        max-width: 520px;
        white-space: nowrap;
        /* Ice-like gradient background using SVG */
        background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="iceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(240, 255, 255, 0.7); stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(200, 240, 255, 0.9); stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23iceGradient)" /></svg>');
        box-shadow: 0px 0px 5px 2px rgba(200, 240, 255, 0.3); /* Subtle glow to add depth */
    }

    .Header {
        font-weight: 500;
        height: 60px;
        line-height: 60px;
        background-color: var(--border-colour);
        color: white;
        font-size: 41px;
        text-transform: uppercase;
    }

    .GameTitleDetailsContainer {
        width: 640px;
        margin-top: 0px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex-grow: 0;
        flex-shrink: 0;
        margin-left: -29px;
    }

    .PlayerChip #TextContainer {
        font-size: 22px;
    }

    .TeamChip #TextContainer {
        font-size: 22px;
    }

    .PlayerChip-1 #TextContainer {
        font-size: 22px;
    }
</style>
