<template>
    <div>
        <div>{{ twitchIcon }}</div>
        <div>{{ runnerName }}</div>
        <div>{{ runnerFlag }}</div>
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator'
    import { store } from '../../browser-util/state'

    @Component({})
    export default class TestPlayerContainer extends Vue {
        index = 0

        get players(): string[] {
            const playerRes = []
            store.state.runDataActiveRun.teams.forEach((team) => {
                team.players.forEach((runner) => {
                    playerRes.push(runner.name)
                })
            })
            return playerRes
        }

        changePlayer(init) {
            if (!init) {
                this.index += 1
                if (this.index >= this.players.length) {
                    this.index = 0
                }
            }
        }
    }
</script>

<style></style>
