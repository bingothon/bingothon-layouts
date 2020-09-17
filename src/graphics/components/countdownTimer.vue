<template>
    <div class="CountdownTimer">
        {{currentTime}}
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import { store } from '../../browser-util/state';

@Component({})
export default class CountdownTimer extends Vue {
    get currentTime(): string {
        return store.state.countdownTimer.time;
    }
}
</script>

<style>
    .CountdownTimer {
        /** TODO */
    }
</style>
