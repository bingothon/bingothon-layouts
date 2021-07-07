<template>
    <div class="Tracker">
        <div>
            {{game}}
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {store} from "../../browser-util/state";
import {Games} from "../../../types";

@Component({
    components: {}
})

export default class Tracker extends Vue {

    mounted() {
        store.dispatch("bindGames", {gameId: "abc"})
        console.log("Dispatched bind")
    }

    get game() {
        return store.state.games;
    }

}
</script>

<style scoped>

</style>
