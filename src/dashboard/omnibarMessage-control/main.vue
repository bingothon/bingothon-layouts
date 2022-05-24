<template>
    <v-app>
        <div v-for="(message, i) in omniBarMessages"
             :key="i"
        >
            <v-text-field
                v-model="messages[i].message"
                @keyup.enter="updateMessage(i)"
            >
                <template v-slot:append-outer>
                    <v-btn
                        dark
                        small
                        @click="deleteMessage(i)"
                    >
                        <v-icon>
                            mdi-minus-circle
                        </v-icon>
                    </v-btn>
                </template>
            </v-text-field>
        </div>
        <v-btn
            dark
            small
            @click="addMessage()"
        >
            <v-icon>
                mdi-plus-circle
            </v-icon>
        </v-btn>
    </v-app>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import {
    OmnibarMessages,
} from '../../../schemas';
import {store} from "../../browser-util/state";

const bundleName = 'bingothon-layouts';

@Component({})
export default class OBSControl extends Vue {

    messages: OmnibarMessages = [];

    get omniBarMessages(): OmnibarMessages {
        this.messages = store.state.omnibarMessages;
        return store.state.omnibarMessages;
    }

    addMessage(): void {
        this.messages.push({message: ""});
        nodecg.Replicant('omnibarMessages').value = this.messages;
    }

    deleteMessage(i: number) {
        this.messages = this.messages.splice(i, 1);
        nodecg.Replicant('omnibarMessages').value = this.messages;
    }

    updateMessage(i: number) {
        console.log("update: ", this.messages[i].message);
        nodecg.Replicant('omnibarMessages').value[i] = this.messages[i];
    }
}
</script>

<style>
</style>
