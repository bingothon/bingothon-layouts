<template>
    <v-app>
        <div v-for="team in runData.teams">
            <div v-for="player in team.players" :key="player.id">
                {{ player.name }}
                <v-text-field
                              v-model="trackerIds[playerNumberFromID(player.name)]" background-color="#455A64" clearable
                              solo single-line dark/>
            </div><!--:value="trackerData[playerNumberFromID(player.name)]"-->
        </div>
        <v-btn
            @click="updateTrackerData"
            class="button"
            small
            :style="'width: 100%'"
        >
            Update Tracker Data
        </v-btn>
    </v-app>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {getReplicant, store} from "../../browser-util/state";
import {RunDataActiveRun, RunDataPlayer, RunDataTeam} from "../../../speedcontrol-types";
import {TrackerData} from "../../../schemas";

@Component({})
export default class TrackerControl extends Vue {
    trackerIds: string[] = ['', '', '', ''];

    get runData(): RunDataActiveRun {
        return store.state.runDataActiveRun;
    }

    get trackerData(): TrackerData {
        return store.state.trackerData;
    }

    playerNumberFromID(id: string) {
        console.log("Triggered playerNumber function")
        let i = 0;
        this.runData.teams.forEach((team : RunDataTeam) => {
            team.players.forEach((player : RunDataPlayer) => {
                if (player.name === id) {
                    console.log("hit" + i)
                    return i;
                }
                i++;
            })
        })
        return -1;
    }

    updateTrackerData() {
        console.log("click")
        console.log(this.trackerIds)
        this.trackerIds.forEach((id, i) => {
            getReplicant<TrackerData>('trackerData').value = [{id: this.trackerIds[0]},
                {id: this.trackerIds[1]}, {id: this.trackerIds[2]}, {id: this.trackerIds[3]}];
            console.log("Updating Tracker ID" + i + "to" + id)
        })
    }
}
</script>

<style scoped>

</style>
