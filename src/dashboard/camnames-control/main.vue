<template>
    <v-app>
        <div
            v-if="!allCamNames.length"
            :style="{ 'font-style': 'italic' }"
        >
            "Cam Names" graphic must be open.
        </div>
        <div
            v-else
            id="CamNamesList"
            :style="{
                'max-height': '250px',
                'overflow-y': 'auto',
            }"
        >
            <v-radio-group
                v-model="currentCamNames.path"
                :value="currentCamNames.path"
                hide-details
                :style="{
                    margin: '0px',
                    padding: '10px',
        }"
            >
                <v-radio
                    v-for="camnames in allCamNames"
                    :id="`camnames-${camnames.path}`"
                    :key="camnames.path"
                    :value="camnames.path"
                    :label="camnames.name"
                    @change="updateCurrentCamNames(camnames)"
                />
            </v-radio-group>
        </div>
    </v-app>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import {
    AllCamNames, CurrentCamNames, CurrentGameLayout,
} from '../../../schemas';
import {store, getReplicant} from '../../browser-util/state';


@Component({})
export default class InterviewControl extends Vue {
    selectedCamNames: string = '';

    mounted() {
        store.watch(state => state.currentCamNames, (newValue) => {
            this.selectedCamNames = newValue.name;
        }, {immediate: true});
    }

    get allCamNames(): AllCamNames {
        return store.state.allCamNames;
    }

    get allCamNamesNames(): string[] {
        return this.allCamNames.map(l => l.name);
    }

    get currentCamNames(): CurrentCamNames {
        return store.state.currentCamNames;
    }

    updateCurrentCamNames(newCamNames) {
        if (!newCamNames) {
            throw new Error("The camNames selected is invalid, that shouldn't happen!");
        }
        getReplicant<CurrentCamNames>('currentCamNames').value = newCamNames;
    }
}
</script>

<style>

</style>
