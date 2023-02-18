<template>
    <v-app>
        <v-btn @click="clearAll">Clear All</v-btn>
        <div v-if="hostsSpeaking">Hosts are currently speaking, don't transition yet</div>
        <div class="checkbox-container">
            <div v-for="(check, i) in actionsChecked" :key="i">
                <v-checkbox v-model="check[1]" :label="check[0]"></v-checkbox>
            </div>
        </div>
    </v-app>
</template>
<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { store } from '../../browser-util/state'

    const ACTION_LIST: string[] = [
        'Switch to Intermission',
        'Play Next Run',
        'Set Up Bingosync Room',
        'Ask for Player Colors',
        'Set the correct layout (for 4p runs ensure if the run is co-op or not)',
        'Check if all Twitch streams are loaded correctly and override them if necessary',
        'Make sure that the streams are cropped correctly',
        'If hosts are not speaking, move runners to live-channel',
        'Ask for Interview',
        'Select the correct audio preset',
        'Unmute the correct Twitch stream',
        'Final Check',
        'Go live and stay hydrated',
    ]

    const ACTION_CHECKED: [string, boolean][] = []
    ACTION_LIST.forEach((a) => {
        ACTION_CHECKED.push([a, false])
    })

    @Component({})
    export default class Checklist extends Vue {
        actionsChecked = ACTION_CHECKED

        get hostsSpeaking() {
            return store.state.hostsSpeakingDuringIntermission.speaking
        }

        clearAll() {
            this.actionsChecked.forEach((action) => {
                Vue.set(action, 1, false)
            })
        }
    }
</script>

<style>
    body {
        /*padding: 1em;*/
    }

    .checkbox-container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .checkbox-container > div {
        width: 50%;
    }

    .border {
        border: 2px solid black;
        border-radius: 5px;
        padding: 5px;
    }

    .row {
        display: flex;
    }

    .column {
        flex: 50%;
    }

    .multiselect {
        border: solid 1px #768948;
        overflow: auto;
    }

    .multiselect label {
        display: block;
    }

    .multiselect-on {
        color: #ffffff;
        background-color: #06ba63;
    }

    #reward {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #06ba63;
        color: white;
        pointer-events: none;
    }

    #reward.show {
        opacity: 1 !important;
    }
</style>
