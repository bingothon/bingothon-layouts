<template>
	<div id="App">
		Game Layout:
		<select
			v-model="selectedLayoutName"
		>
			<option
				v-for="(layout,i) in allGameLayoutNames"
				:key="i"
				:value="layout"
			>
				{{ layout }}
			</option>
		</select>
		<button @click="updateCurrentLayout">
			Update Layout
		</button>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { nodecg } from '../../browser-util/nodecg';
import {
	AllGameLayouts, CurrentGameLayout,
} from '../../../schemas';
import { store, getReplicant } from '../../browser-util/state';
@Component({})
export default class LayoutControl extends Vue {
	selectedLayoutName: string = '';
	mounted() {
		store.watch(state => state.currentGameLayout, (newValue) => {
			this.selectedLayoutName = newValue.name;
			nodecg.log.info(`updating to ${newValue.name}`);
		}, { immediate: true });
	}
	get allGameLayouts(): AllGameLayouts {
		return store.state.allGameLayouts;
	}
	get allGameLayoutNames(): string[] {
		return this.allGameLayouts.map(l => l.name);
	}
	get currentGameLayout(): CurrentGameLayout {
		return store.state.currentGameLayout;
	}
	updateCurrentLayout() {
		const newLayout = this.allGameLayouts.find(l => l.name === this.selectedLayoutName);
		if (!newLayout) {
			throw new Error("The layout selected is invalid, that shouldn't happen!");
		}
		getReplicant<CurrentGameLayout>('currentGameLayout').value = newLayout;
	}
}
</script>

<style>
</style>
