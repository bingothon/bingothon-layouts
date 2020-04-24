<template>
    <div>
        <div class="GameName FlexContainer">{{gameName}}</div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { store } from '../../browser-util/state';
import TextFit from "../helpers/text-fit.vue";

@Component({
  components: {
    TextFit,
  }
})
export default class TestGameContainer extends Vue {
    get gameName(): string {
        return store.state.runDataActiveRun.game;
    }
}
</script>



<style>
.GameName {
    width: 100%;
    height: 100%;
    text-align: center;
}
/*#est {
    font-size: 20px;
    align-content: center;
    color: white;
    text-align: center;
}*/

</style>