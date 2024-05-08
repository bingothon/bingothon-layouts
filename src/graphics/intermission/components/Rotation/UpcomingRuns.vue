<template>
    <div id="UpcomingRuns">
        <run-upcoming
            v-for="run in runs"
            :key="`${Date.now()}${run[0].id}`"
            :data="run[0]"
            :when="run[1]"
        ></run-upcoming>
    </div>
</template>

<script lang="ts">
    import clone from 'clone';
    import RunUpcoming from '../RunUpcoming.vue';
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { RunData } from '../../../../../speedcontrol-types';

    @Component({
        components: {
            RunUpcoming
        }
    })
    export default class UpcomingRuns extends Vue {
        @Prop({ required: true })
        nextRuns: RunData[];

        // runData, when
        runs: [RunData, number | undefined][] = [];
        whenTotal: number = 0;

        mounted() {
            if (!this.nextRuns.length) {
                this.$emit('end');
                return;
            }
            for (let i = 0; i < this.nextRuns.length; i += 1) {
                const cloned = clone(this.nextRuns[i]);
                const when = this.whenTotal;
                this.whenTotal += this.nextRuns[i].estimateS;
                this.whenTotal += this.nextRuns[i].setupTimeS;
                if (i !== 0) {
                    this.runs.push([cloned, when]);
                }
            }
            setTimeout(() => this.$emit('end'), 20 * 1000);
        }
    }
</script>

<style>
    #UpcomingRuns {
        position: absolute;
        display: flex;
        height: 100%;
        width: 100%;
        flex-direction: column;
        justify-content: space-around;
    }
</style>
