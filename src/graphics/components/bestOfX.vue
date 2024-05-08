<!-- This component handles displays each player's information within a team. -->
<!-- This is added dynamically to the PlayerContainer component when we need to show this. -->
<!-- It is initialised with most info, it only listens to nodecg-speedcontrol for finish times. -->

<template>
    <div class="MatchCounter FlexContainer">
        <div
            v-for="i in Math.ceil(totalMatches / 2)"
            class="ScoreCounter FlexContainer"
            :style="{ height: height }"
            :key="i"
        >
            <div v-if="i <= score" class="Score Counter" :style="{ height: height }">
                <div class="ScoreIndicator" :style="{ height: height }" />
            </div>
            <div v-else class="NoScore Counter" :style="{ height: height }">
                <div class="ScoreIndicator grey" :style="{ height: height }" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { store } from '../../browser-util/state';

    @Component({
        components: {}
    })
    export default class BestOfX extends Vue {
        @Prop({ default: -1 })
        playerIndex: number;

        @Prop({ default: '55px' })
        height: string;

        get score(): number {
            return store.state.bestOfX.matchCounts[this.playerIndex];
            // return true;
        }

        get totalMatches(): number {
            return store.state.bestOfX.totalMatches;
        }
    }
</script>

<style>
    .ScoreCounter > .Counter {
        margin-right: 10px;
        width: auto;
        position: relative;
    }

    .ScoreCounter > .Counter > img {
        height: 100%;
        width: auto;
        position: relative;
        filter: drop-shadow(0 0 0.75rem);
    }

    .ScoreCounter {
        width: 100%;
    }

    .ScoreCounter > .Score > img {
        height: 90px;
    }

    .ScoreIndicator {
        width: 20px;
        background-color: gold;
    }

    .MatchCounter > img {
        height: 100%;
        position: absolute;
        filter: invert(1);
    }

    .MatchCounter.ScoreCounter.NoScore > img {
        filter: grayscale(100%);
    }

    .grey {
        filter: grayscale(100%);
    }

    .MatchCounter {
        height: 50px;
        margin-right: 10px;
    }
</style>
