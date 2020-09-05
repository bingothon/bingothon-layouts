<template>
	<div class="GameContainer FlexContainer">
		<div class="GameName FlexContainer">{{gameName}}</div>
		<div class="GameExtra FlexContainer">{{gameCategory}}</div>
	</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { store } from '../../browser-util/state';

@Component({})
export default class TestGameContainer extends Vue {
	get gameName(): string {
		return store.state.runDataActiveRun.game;
	}

	get gameCategory(): string {
		return store.state.runDataActiveRun.category;
	}

	get gameSystem(): string {
		return store.state.runDataActiveRun.system;
	}

	get gameEstimate(): string {
		return store.state.runDataActiveRun.estimate;
	}
}
</script>

<style>
.GameContainer {
	align-content: center;
	align-items: center;
	flex-direction: column;
}

.GameContainer > .GameName {
	font-weight: 500;
	font-size: 30px;
	align-content: center;
	align-items: center;
	color: white;
	text-align: center;
	margin: 5px;
	text-shadow: 3px 3px 5px black;
}

.GameContainer > .GameExtra {
	font-size: 20px;
	font-weight: thin;
	align-content: center;
	color: white;
	text-align: center;
	text-shadow: 1px 1px 5px black;
}

/*#est {
    font-size: 20px;
    align-content: center;
    color: white;
    text-align: center;
}*/

</style>
