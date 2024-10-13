<template>
    <div class="CountdownContainer FlexContainer">
        <div class="CountdownTimer FlexContainer" v-html="currentTime"></div>
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator';

    import { store } from '../../browser-util/state';

    @Component({})
    export default class CountdownTimer extends Vue {
        get currentTime(): string {
            return this.splitStringToSpans(store.state.countdownTimer.time);
        }

        splitStringToSpans(string) {
            return string.replace(/\S/g, '<span>$&</span>');
        }
    }
</script>

<style>
    .CountdownContainer {
        flex-direction: column;
        color: white;
    }
    .CountdownTimer {
        font-weight: 500;
        font-size: 100px;
        transition: 1s;
        align-content: center;
        text-align: center;
    }
    /* Each character in the timer is in a span; setting width so the numbers appear monospaced. */
    .CountdownTimer >>> span {
        display: inline-block;
        width: 0.6em;
        margin: 0.01em;
        text-align: center;
        font-weight: bold;
    }
    .CountdownTimer >>> span:nth-of-type(3),
    .TimerBox >>> span:nth-of-type(6) {
        width: 0.22em;
        margin-top: -0.15em; /* Make the colon appear more towards the centre. */
    }
</style>
