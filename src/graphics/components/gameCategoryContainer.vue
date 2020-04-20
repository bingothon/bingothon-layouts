<template>
    <div>
        <div class="GameCategory FlexContainer">{{gameCategory}}</div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { store } from '../../browser-util/state';

@Component({})
export default class GameCategoryContainer extends Vue {
   
    get gameCategory(): string {
        return store.state.runDataActiveRun.category;
    }
}
</script>

<style>


/*#est {
    font-size: 20px;
    align-content: center;
    color: white;
    text-align: center;
}*/

</style>