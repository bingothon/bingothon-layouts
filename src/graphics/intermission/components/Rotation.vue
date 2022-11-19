<template>
    <div id="Rotation">
        <transition name="fade">
            <component :is="currentComponent" :next-runs="nextRuns" @end="showNextMsg"> </component>
        </transition>
    </div>
</template>

<script lang="ts">
    import UpcomingRuns from './Rotation/UpcomingRuns.vue'
    import Bid from './Rotation/Bid.vue'
    import Prize from './Rotation/Prize.vue'
    import Socials from './Rotation/Socials.vue'
    import { Component, Vue } from 'vue-property-decorator'
    import { store } from '../../../browser-util/state'
    import { RunData } from '../../../../speedcontrol-types'

    @Component({
        components: {
            UpcomingRuns,
            Bid,
            Prize,
            Socials,
        },
    })
    export default class Rotation extends Vue {
        currentComponent = null
        componentArray: Array<any> = [UpcomingRuns, Bid, Prize, Socials]
        index: number = 0
        nextRuns: RunData[] = []

        mounted() {
            this.updateNextRuns()
            this.showNextMsg()
            nodecg.listenFor('forceRefreshIntermission', () => this.updateNextRuns())
        }

        showNextMsg() {
            if (this.index >= this.componentArray.length) {
                this.index = 0
            }
            this.currentComponent = this.componentArray[this.index]
            this.index += 1
        }

        updateNextRuns() {
            this.nextRuns = store.state.runDataArray.slice(this.findRunIndex() + 1).slice(0, 4)
        }

        findRunIndex(): number {
            let curRunID = store.state.runDataActiveRun.id
            if (!curRunID) {
                return -1
            }
            return store.state.runDataArray.findIndex((run) => run.id === curRunID)
        }
    }
</script>

<style>
    #Rotation {
        position: absolute;
    }
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 1s;
    }
    .fade-enter,
    .fade-leave-to {
        opacity: 0;
    }
</style>
