<template>
    <v-app>
        <div
            v-if="!allGameLayouts.length"
            :style="{ 'font-style': 'italic' }"
        >
            "Game Layout" graphic must be open.
        </div>
        <div
            v-else
            id="LayoutList"
            :style="{
                'max-height': '250px',
                'overflow-y': 'auto',
            }"
        >
            <v-radio-group
                v-model="currentGameLayout.path"
                :value="currentGameLayout.path"
                hide-details
                :style="{
                    margin: '0px',
                    padding: '10px',
        }"
            >
                <v-radio
                    v-for="layout in allGameLayouts"
                    :id="`layout-${layout.path}`"
                    :key="layout.path"
                    :value="layout.path"
                    :label="layout.name"
                    @change="updateCurrentLayout(layout)"
                />
            </v-radio-group>
        </div>
    </v-app>
</template>

<script lang="ts">
import {Component, Vue, Watch} from 'vue-property-decorator';
import {
    AllGameLayouts, CurrentGameLayout,
} from '../../../schemas';
import {store, getReplicant} from '../../browser-util/state';
import goTo from 'vuetify/es5/services/goto';


@Component({})
export default class LayoutControl extends Vue {
    selectedLayoutName: string = '';

    //"Heavily inspired" by https://github.com/esamarathon/esa-layouts/blob/302f2a8a31948bfe0fd35b6cbe75c7ccecd0c4a6/src/dashboard/game-layout-override/main.vue

    get allGameLayouts(): AllGameLayouts {
        return store.state.allGameLayouts;
    }

    get allGameLayoutNames(): string[] {
        return this.allGameLayouts.map(l => l.name);
    }

    get currentGameLayout(): CurrentGameLayout {
        return store.state.currentGameLayout;
    }

    updateCurrentLayout(newLayout: CurrentGameLayout) {
        if (!newLayout) {
            throw new Error("The layout selected is invalid, that shouldn't happen!");
        }
        getReplicant<CurrentGameLayout>('currentGameLayout').value = newLayout;
    }

    @Watch('currentGameLayout')
    async scrollToSelectedLayout(): Promise<void> {
        try {
            await Vue.nextTick();
            if (this.currentGameLayout) {
                goTo(`#layout-${this.currentGameLayout.path}`, {container: '#LayoutList', offset: 25});
            } else {
                goTo(0, {container: '#LayoutList'});
            }
        } catch (err) {
            // Not sure if this can error, but better be safe
        }
    }

    @Watch('allGameLayouts')
    onGameLayoutsChange(): void {
        if (this.allGameLayouts.length) {
            this.scrollToSelectedLayout();
        }
    }

    mounted(): void {
        this.scrollToSelectedLayout();
    }
}
</script>

<style>
.v-input--hide-details > .v-input__control > .v-input__slot {
    margin-bottom: 2px !important;
}
</style>
