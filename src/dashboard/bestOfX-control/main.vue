<template>
    <div>
        <v-checkbox
            dark
            v-model="enabled"
            :label="'Enable Best Of ' + totalMatches"
            @change="changeEnabled"
        ></v-checkbox>
        <span>Total Amount of Matches</span>
        <v-text-field
            :value="totalMatches"
            @change="updateTotal"
            background-color="#455A64"
            class="score-count"
            dark
            type="number"
        />
        <div v-if="enabled" v-for="(team, i) in teams" :key="(team, i)">
            <span>Player {{ i }} won Matches</span>
            <v-text-field
                v-model="matchCounts[i]"
                background-color="#455A64"
                class="score-count"
                dark
                type="number"
                @change="updateMatchScores"
            />
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { getReplicant, store } from '../../browser-util/state'
    import { BestOfX } from '../../../schemas'

    @Component({})
    export default class BingoControl extends Vue {
        total: string = this.totalMatches

        // --- computed properties
        get enabled(): boolean {
            return store.state.bestOfX.enabled
        }

        get matchScores(): number[] {
            return store.state.bestOfX.matchCounts
        }

        get totalMatches(): string {
            return `${store.state.bestOfX.totalMatches}`
        }

        get matchCounts(): string[] {
            return store.state.bestOfX.matchCounts.map((i) => `${i}`)
        }

        get teams(): string[] {
            let ids = []
            store.state.runDataActiveRun.teams.forEach((team) => {
                ids.push(team.id)
            })
            return ids
        }

        updateMatchScores() {
            this.matchCounts.forEach((score: string, idx: number) => {
                getReplicant<BestOfX>('bestOfX').value.matchCounts[idx] = parseInt(score, 10)
            })
        }

        changeEnabled() {
            getReplicant<BestOfX>('bestOfX').value.enabled = !this.enabled
        }

        updateTotal(newVal: string) {
            getReplicant<BestOfX>('bestOfX').value.totalMatches = parseInt(newVal, 10)
        }
    }
</script>

<style>
    v-text-field.score-count {
        width: 3em;
    }

    .button {
        margin: 3px;
    }

    .line-buttons > .v-btn {
        width: 100%;
    }
</style>
