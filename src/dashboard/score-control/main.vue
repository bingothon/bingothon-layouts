<template>
    <v-app>
        <div v-for="(player, i) in players" :key="i">
            {{ player.displayName }}: {{ player.score }}
            
            <v-text-field
                v-model="nextScores[i]"
                background-color="#455A64"
                class="score-count"
                dark
                type="number"
            ></v-text-field>
        </div>
        <!--:value="trackerData[player.index]"-->
        <v-btn @click="updateScores" class="button" small :style="'width: 100%'"> Update Scores </v-btn>
    </v-app>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import { getReplicant, store } from '../../browser-util/state';
    import { ScorePlayers, TrackerData } from '../../../schemas';

    @Component({})
    export default class ScoreControl extends Vue {

        nextScores: string[] = [];

        get players(): ScorePlayers {
            return store.state.scorePlayers;
        }

        @Watch('players', { immediate: true })
        onPlayersUpdated(players: ScorePlayers) {
            this.nextScores = players.map(player => `${player.score}`);
        }

        updateScores() {
            const newPlayerScores = this.players.map((player, index) => ({...player, score: parseInt(this.nextScores[index])}));
            getReplicant<ScorePlayers>("scorePlayers").value = newPlayerScores;
        }
    }
</script>

<style scoped></style>
