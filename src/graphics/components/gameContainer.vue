<template>
    <div class="GameContainer FlexContainer">
        <div class="GameName FlexContainer">{{gameName}}</div>
        <div class="GameExtra FlexContainer">{{gameCategory}} | {{gameSystem}}</div>
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
    font-size: 18px;
    font-weight: thin;
    align-content: center;
    color: #c8c8c8;
    text-align: center;
}

/*#est {
    font-size: 20px;
    align-content: center;
    color: white;
    text-align: center;
}*/

</style>
