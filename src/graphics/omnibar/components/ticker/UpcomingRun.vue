<template>
    <div v-if="run" id="UpcomingRun" class="FlexContainer">
        <div class="Line1">Coming up {{ when }}: {{ run.game }}</div>
        <div class="Line2">
            <span v-if="run.category">
                {{ run.category }}
            </span>
            <span v-if="run.system"> ran on {{ run.system }} </span>
            <span v-if="checkForTotalPlayers(run) > 0"> with {{ formPlayerNamesString(run) }} </span>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator'
    import moment from 'moment'
    import clone from 'clone'
    import { RunData } from '../../../../../speedcontrol-types'
    import { store } from '../../../../browser-util/state'
    // Stored outside of the export so it persists.
    let nextRunsCache: RunData[] = []
    let currentRunID: string = null

    @Component({})
    export default class UpcomingRun extends Vue {
        @Prop({ default: null })
        data: Object

        run: RunData = null

        when: string = ''

        created() {
            const fallback = setTimeout(() => this.$emit('end'), 5000)
            // check if the current run changed, if yes refresh the cache
            if (!currentRunID || currentRunID != this.currentRunID) {
                const nextRuns = this.getNextRuns()
                // Skip if nothing to show.
                if (!nextRuns.length) {
                    this.$emit('end')
                    return
                }
                nextRunsCache = nextRuns
            }
            const randNum = Math.floor(Math.random() * nextRunsCache.length)
            this.run = clone(nextRunsCache[randNum])
            if (this.run.scheduledS === undefined || this.run.scheduledS < Date.now() / 1000) {
                this.when = 'Soon™'
            } else {
                this.when = moment.unix(this.run.scheduledS).fromNow()
            }
            nextRunsCache.splice(randNum, 1)
            clearTimeout(fallback)
            setTimeout(() => this.$emit('end'), 25 * 1000)
        }

        get currentRunID(): string {
            let curRun = store.state.runDataActiveRun
            if (!curRun) {
                return null
            }
            return curRun.id
        }

        formPlayerNamesString(run: RunData): string {
            const namesArray = []
            let namesList = 'No Player(s)'
            run.teams.forEach((team) => {
                const teamPlayerArray = []
                team.players.forEach((player) => teamPlayerArray.push(player.name))
                namesArray.push(teamPlayerArray.join(', '))
            })
            if (namesList.length) {
                namesList = namesArray.join(' vs. ')
            }
            return namesList
        }

        checkForTotalPlayers(run: RunData): number {
            let amount = 0
            run.teams.forEach((team) =>
                team.players.forEach(() => {
                    amount += 1
                }),
            )
            return amount
        }

        getNextRuns(): RunData[] {
            const runIndex = this.findRunIndex()
            return store.state.runDataArray.slice(runIndex + 1).slice(0, 4)
        }

        findRunIndex(): number {
            let curRunID = this.currentRunID
            if (!curRunID) {
                return -1
            }
            return store.state.runDataArray.findIndex((run) => run.id === curRunID)
        }
    }
</script>

<style scoped>
    #UpcomingRun {
        padding: 0 17px;
        height: 100%;
        font-weight: 500;
        flex-direction: column;
        align-items: flex-start;
    }
    .Line1 {
        font-size: 25px;
    }
    .Line2 {
        font-size: 22px;
    }
</style>
