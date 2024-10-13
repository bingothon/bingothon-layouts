<template>
    <div>
        <v-btn @click="showHideTimerToggle" dark>
            <template v-if="showOnLayouts">Hide on Layouts</template>
            <template v-else>Show on Layouts</template>
        </v-btn>
        <v-tooltip :disabled="disableEditing" bottom>
            <template v-slot:activator="{ on, attrs }">
                <span v-on="on">
                    <v-text-field
                        v-model="time"
                        v-bind="attrs"
                        :background-color="bgColour"
                        :readonly="disableEditing"
                        class="timeInput"
                        single-line
                        solo
                        dark
                        type="text"
                        @blur="abandonEdit"
                        @keyup.enter="finishEdit"
                    />
                </span>
            </template>
            <span>Click to edit, Enter to save</span>
        </v-tooltip>
        <div id="Controls" class="d-flex justify-center">
            <v-btn @click="doStartStopAction" dark>
                <v-icon v-if="timerState === 'running'"> mdi-pause </v-icon>
                <v-icon v-else> mdi-play </v-icon>
            </v-btn>
            <v-btn v-if="timerState !== 'running'" @click="resetTimer" dark>
                <v-icon> mdi-skip-previous </v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import { getReplicant, store } from '../../browser-util/state';
import { LayoutMeta } from 'schemas/layoutMeta';

    const bingothonBundleName = 'score-layouts';
    @Component({})
    export default class TimerControl extends Vue {
        time: string = '00:00';

        get showOnLayouts(): boolean {
            return store.state.layoutMeta.showTimer;
        }

        showHideTimerToggle() {
            getReplicant<LayoutMeta>('layoutMeta').value.showTimer = !this.showOnLayouts;
        }

        get timerState(): string {
            return store.state.layoutTimer.state;
        }

        get timerTime(): string {
            return store.state.layoutTimer.time;
        }

        get bgColour(): string {
            switch (store.state.layoutTimer.state) {
                case 'stopped':
                default:
                    return '#455A64';
                case 'running':
                    return '';
            }
        }

        get disableEditing(): boolean {
            return ['running'].includes(store.state.layoutTimer.state);
        }

        get startStopActionName(): string {
            return store.state.layoutTimer.state !== 'stopped' ? 'Stop' : 'Start';
        }

        @Watch('timerTime', { immediate: true })
        updateTime(val: string): void {
            this.time = val;
        }

        abandonEdit(): void {
            this.time = this.timerTime;
        }

        finishEdit(): void {
            const match = this.time.match(/^((?<hours>\d+):)?(?<minutes>\d{1}|\d{2}):(?<seconds>\d{2})$/);
            if (match) {
                console.log(match.groups);
                const seconds =
                    parseInt(match.groups['hours'] || '0') * 3600 +
                    parseInt(match.groups['minutes']) * 60 +
                    parseInt(match.groups['seconds']);
                nodecg.sendMessageToBundle('layoutTimer:setTime', bingothonBundleName, seconds);
            }
            (event.target as HTMLTextAreaElement).blur();
        }

        doStartStopAction(): void {
            if (store.state.layoutTimer.state !== 'stopped') {
                nodecg.sendMessageToBundle('layoutTimer:stop', bingothonBundleName);
            } else {
                nodecg.sendMessageToBundle('layoutTimer:start', bingothonBundleName);
            }
        }

        resetTimer() {
            nodecg.sendMessageToBundle('layoutTimer:setTime', bingothonBundleName, 0);
        }
    }
</script>

<style scoped>
    .timeInput >>> input {
        text-align: center;
        font-size: 25px;
    }

    #Controls > * {
        flex: 1;
    }
    #Controls > *:not(:first-child) {
        margin-left: 5px;
    }
    #Controls >>> .v-btn {
        min-width: 0;
        width: 100%;
    }
</style>
