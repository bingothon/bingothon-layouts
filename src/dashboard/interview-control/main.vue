<template>
    <div>
        Interview:
        <select v-model="selectedInterviewName">
            <option v-for="(interview, i) in allInterviewNames" :key="i" :value="interview">
                {{ interview }}
            </option>
        </select>
        <button @click="updateCurrentInterview">Update Interview</button>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { AllInterviews, CurrentInterview } from '../../../schemas'
    import { store, getReplicant } from '../../browser-util/state'

    @Component({})
    export default class InterviewControl extends Vue {
        selectedInterviewName: string = ''

        mounted() {
            store.watch(
                (state) => state.currentInterview,
                (newValue) => {
                    this.selectedInterviewName = newValue.name
                },
                { immediate: true },
            )
        }

        get allInterviews(): AllInterviews {
            return store.state.allInterviews
        }

        get allInterviewNames(): string[] {
            return this.allInterviews.map((l) => l.name)
        }

        get currentInterview(): CurrentInterview {
            return store.state.currentInterview
        }

        updateCurrentInterview() {
            const newInterview = this.allInterviews.find((l) => l.name === this.selectedInterviewName)
            if (!newInterview) {
                throw new Error("The interview selected is invalid, that shouldn't happen!")
            }
            getReplicant<CurrentInterview>('currentInterview').value = newInterview
        }
    }
</script>

<style></style>
