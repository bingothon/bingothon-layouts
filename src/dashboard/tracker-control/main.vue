<template>
    <v-app>
        <div v-for="(player, i) in players" :key="i">
            {{ player.name }}
            <v-text-field
                v-model="trackerIds[i]"
                background-color="#455A64"
                clearable
                solo
                single-line
                dark
            ></v-text-field>
        </div>
        <!--:value="trackerData[player.index]"-->
        <v-btn @click="updateTrackerData" class="button" small :style="'width: 100%'"> Update Tracker Data </v-btn>
    </v-app>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { getReplicant, store } from '../../browser-util/state';
    import { TrackerData } from '../../../schemas';

    interface IndexedPlayer {
        name: string;
        index: number;
    }

    @Component({})
    export default class TrackerControl extends Vue {
        get trackerIds(): string[] {
            return store.state.trackerData.map((tracker) => tracker.id);
        }

        get trackerData(): TrackerData {
            return store.state.trackerData;
        }

        get players(): IndexedPlayer[] {
            let idx = 0;
            let arr = [];
            store.state.runDataActiveRun.teams.forEach((t) => {
                t.players.forEach((p) => {
                    arr.push({ name: p.name, index: idx });
                    idx++;
                });
            });
            return arr;
        }

        updateTrackerData() {
            console.log('click');
            console.log(this.trackerIds);
            let newVal = [];
            this.trackerIds.forEach((id) => {
                console.log(typeof id);
                newVal.push({ id: id, password: '' });
            });
            getReplicant<TrackerData>('trackerData').value = newVal;
        }
    }
</script>

<style scoped></style>
