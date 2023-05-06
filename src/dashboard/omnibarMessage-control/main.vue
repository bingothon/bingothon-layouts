<template>
    <v-app>
        <div v-for="(message, i) in messages" :key="i">
            <v-text-field v-model="messages[i].message" @keyup.enter="updateMessage(i)">
                <template v-slot:append-outer>
                    <v-btn
                        :disabled="messages[i].message === (omniBarMessages[i] || {}).message"
                        dark
                        small
                        @click="updateMessage(i)"
                    >
                        <v-icon> mdi-content-save </v-icon>
                    </v-btn>
                    <v-btn dark small @click="deleteMessage(i)">
                        <v-icon> mdi-minus-circle </v-icon>
                    </v-btn>
                </template>
            </v-text-field>
        </div>
        <v-text-field v-model="newMessage" @keyup.enter="addMessage()">
            <template v-slot:append-outer>
                <v-btn :disabled="!newMessage" dark small @click="addMessage()">
                    <v-icon> mdi-plus-circle </v-icon>
                </v-btn>
            </template>
        </v-text-field>
    </v-app>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import { OmnibarMessages } from '../../../schemas';
    import { store } from '../../browser-util/state';
    import clone from 'clone';

    @Component({})
    export default class OBSControl extends Vue {
        messages: OmnibarMessages = [];
        newMessage: string = '';

        get omniBarMessages(): OmnibarMessages {
            return store.state.omnibarMessages;
        }

        @Watch('omniBarMessages', { immediate: true })
        updateMsgsFromReplicant() {
            this.messages = clone(this.omniBarMessages);
        }

        addMessage(): void {
            if (this.newMessage) {
                this.messages.push({ message: this.newMessage });
                this.newMessage = '';
                nodecg.Replicant('omnibarMessages').value = this.messages;
            }
        }

        deleteMessage(i: number) {
            this.messages = this.messages.filter((_, idx) => i !== idx);
            nodecg.Replicant('omnibarMessages').value = this.messages;
        }

        updateMessage(i: number) {
            console.log('update: ', this.messages[i].message);
            nodecg.Replicant('omnibarMessages').value[i] = this.messages[i];
        }
    }
</script>

<style></style>
