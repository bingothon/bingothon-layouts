<template>
    <div>
        <div>Current State: {{ currentChatBotState }}</div>
        <v-btn dark @click="doReconnect" :disabled="!canReconnect">Reconnect</v-btn>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { store } from '../../browser-util/state';

    @Component({})
    export default class ChatBotControl extends Vue {
        // --- computed properties
        get currentChatBotState(): string {
            return store.state.twitchChatBotData.state;
        }

        get canReconnect(): boolean {
            return 'connected' === store.state.twitchChatBotData.state;
        }

        doReconnect() {
            nodecg.sendMessageToBundle('twitchChatBot:reconnect', 'bingothon-layouts');
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
