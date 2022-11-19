<template>
    <v-app>
        <div v-for="player in players" :key="player.index">
            {{ player.name }}
            <v-text-field
                v-model="trackerIds[player.index]"
                background-color="#455A64"
                clearable
                solo
                single-line
                dark
            />
        </div>
        <!--:value="trackerData[player.index]"-->
        <v-btn @click="updateTrackerData" class="button" small :style="'width: 100%'"> Update Tracker Data </v-btn>
    </v-app>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator'
    import { getReplicant, store } from '../../browser-util/state'
    import { RunDataActiveRun, RunDataPlayer, RunDataTeam } from '../../../speedcontrol-types'
    import { TrackerData } from '../../../schemas'

    interface IndexedPlayer {
        name: string
        index: number
    }

    @Component({})
    export default class TrackerControl extends Vue {
        trackerIds: string[] = ['', '', '', '']

        get runData(): RunDataActiveRun {
            return store.state.runDataActiveRun
        }

        get trackerData(): TrackerData {
            return store.state.trackerData
        }

        get players(): IndexedPlayer[] {
            let idx = 0
            let arr = []
            store.state.runDataActiveRun.teams.forEach((t) => {
                t.players.forEach((p) => {
                    arr.push({ name: p.name, index: idx })
                    idx++
                })
            })
            return arr
        }

        updateTrackerData() {
            console.log('click')
            console.log(this.trackerIds)
            let newVal = []
            this.trackerIds.forEach((id) => {
                console.log(typeof id)
                newVal.push({ id: id, password: '' })
            })
            getReplicant<TrackerData>('trackerData').value = newVal
        }
    }
</script>

<style scoped></style>
