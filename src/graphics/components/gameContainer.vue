<template>
    <div class="GameContainer FlexContainer">
        <div class="GameName FlexContainer"><!--{{gameName}}--><img src="../../../static/Super_Mario_Sunshine_logo.png" id="logo"></div>
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
}

.GameContainer > .GameExtra {
	position: absolute;
	top: 200px;
    font-size: 30px;
    font-weight: thin;
    align-content: center;
    color: #d2d2d2;
    text-align: center;
}

#logo {
	position: absolute;
	height: 150px;
	top: 25px;
}

/*#est {
    font-size: 20px;
    align-content: center;
    color: white;
    text-align: center;
}*/

</style>
