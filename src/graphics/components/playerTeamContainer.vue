<template>
    <div class="PlayerTeamContainer FlexContainer">
        <div class="PlayerInfo1">
            <player-info
                :playerIndex="playerIndex"
                :hideFinishTime="true"
                :showColor="false"
                :height="height"
                :style="{ 'margin-right': margin }"
            ></player-info>
        </div>
        <div class="TeamInfo">
            <team-info :teamIndex="teamIndex" :height="height"></team-info>
        </div>
        <div class="PlayerInfo2">
            <player-info
                :playerIndex="playerIndex + 1"
                :hideFinishTime="true"
                :showColor="false"
                :height="height"
                :reverseOrder="true"
                :style="{ 'margin-left': margin }"
            ></player-info>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';

    import PlayerInfo from './playerInfo.vue';
    import TeamInfo from './teamInfo.vue';
    import { store } from '../../browser-util/state';

    @Component({
        components: {
            PlayerInfo,
            TeamInfo,
        },
    })
    export default class PlayerTeamContainer extends Vue {
        @Prop({ default: -1 })
        teamIndex: number;

        @Prop({ default: '55px' })
        height: string;

        @Prop({ default: '20px' })
        margin: string;

        get playerIndex(): number {
            var idx = 0;
            for (let i = 0; i < this.teamIndex; i++) {
                idx += store.state.runDataActiveRun.teams[i].players.length;
            }
            return idx;
        }
    }
</script>

<style>
    .PlayerTeamContainer {
        flex-direction: column;
        width: 100%;
        background-image: linear-gradient(to right, var(--lighter-main-color), var(--darker-main-color));
        border-radius: 5px; /* Rounded corners */
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* A subtle shadow for depth */
        transition: transform 0.3s, box-shadow 0.3s; /* Transition effect for hover state */
        overflow: hidden; /* Ensures child elements don't exceed the rounded corners */
    }

    .PlayerTeamContainer:hover {
        transform: scale(1.05); /* A slight zoom effect on hover */
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15); /* A deeper shadow on hover */
    }

    .PlayerTeamContainer > .PlayerInfo1,
    .PlayerTeamContainer > .TeamInfo,
    .PlayerTeamContainer > .PlayerInfo2 {
        width: 100%;
    }

    .TeamInfo {
        border-top: 2px solid rgba(255, 255, 255, 0.1); /* A subtle separator */
        border-bottom: 2px solid rgba(255, 255, 255, 0.1); /* A subtle separator */
    }
</style>
