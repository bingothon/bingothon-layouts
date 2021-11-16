<template>
    <div class="Tracker">
        <div :class="`Sword ${!game.sword ? 'greyed' : ''}`">
            <img :src="`${basePath}sword_${game.sword || 0}.png`">
        </div>
        <div :class="`Crystal ${!game.crystals ? 'greyed' : ''}`">
            <img :src="`${basePath}crystal.png`">
            {{ game.crystals || 0 }}
        </div>
        <div :class="`Beetle ${!game.beetle ? 'greyed' : ''}`">
            <img :src="`${basePath}beetle_${game.beetle || 0}.png`">
        </div>
        <div :class="`Mitts ${!game.mitts ? 'greyed' : ''}`">
            <img :src="`${basePath}mitts_${game.mitts || 0}.png`">
        </div>
        <div :class="`Scale ${!game.mitts ? 'greyed' : ''}`">
            <img :src="`${basePath}scale.png`">
        </div>
        <div :class="`Earrings ${!game.earrings ? 'greyed' : ''}`">
            <img :src="`${basePath}earrings.png`">
        </div>
        <div :class="`Bottles ${!game.bottles ? 'greyed' : ''}`">
            <img :src="`${basePath}bottle.png`">
            {{ game.bottles || 0 }}
        </div>
        <div :class="`Bugnet ${!game.bugnet ? 'greyed' : ''}`">
            <img :src="`${basePath}bugnet.png`">
        </div>
        <div :class="`Slingshot ${!game.slingshot ? 'greyed' : ''}`">
            <img :src="`${basePath}slingshot.png`">
        </div>
        <div :class="`Bombs ${!game.bombs ? 'greyed' : ''}`">
            <img :src="`${basePath}bombs.png`">
        </div>
        <div :class="`Bellows ${!game.bellows ? 'greyed' : ''}`">
            <img :src="`${basePath}bellows.png`">
        </div>
        <div :class="`Whip ${!game.whip ? 'greyed' : ''}`">
            <img :src="`${basePath}whip.png`">
        </div>
        <div :class="`Clawshots ${!game.clawshots ? 'greyed' : ''}`">
            <img :src="`${basePath}clawshots.png`">
        </div>
        <div :class="`Bow ${!game.bow ? 'greyed' : ''}`">
            <img :src="`${basePath}bow.png`">
        </div>
        <div :class="`Seachart ${!game.seachart ? 'greyed' : ''}`">
            <img :src="`${basePath}sea_chart.png`">
        </div>
        <div :class="`SpiralCharge ${!game.spiralcharge ? 'greyed' : ''}`">
            <img :src="`${basePath}spiral_charge.png`">
        </div>
        <div :class="`CavesKey ${!game.caveskey ? 'greyed' : ''}`">
            <img :src="`${basePath}caveskey.png`">
        </div>
        <div :class="`Letter ${!game.letter ? 'greyed' : ''}`">
            <img :src="`${basePath}letter.png`">
        </div>
        <div :class="`Rattle ${!game.rattle ? 'greyed' : ''}`">
            <img :src="`${basePath}rattle.png`">
        </div>
        <div :class="`Cage ${!game.cage ? 'greyed' : ''}`">
            <img :src="`${basePath}cage.png`">
        </div>
        <div :class="`Pouch ${!game.pouch ? 'greyed' : ''}`">
            <img :src="`${basePath}pouch.png`">
            {{ game.pouch || 0 }}
        </div>
        <div :class="`Wallet`">
            <img :src="`${basePath}wallet_${game.wallet || 0}.png`">
        </div>
        <div :class="`SoT ${!game.sot ? 'greyed' : ''}`">
            <img :src="`${basePath}stone_of_trials.png`">
        </div>
        {{ game }}
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

    basePath = '/bundles/bingothon-layouts/static/tracker/skyward-sword/'

    mounted() {
        store.dispatch("bindGames", {gameId: "abc"})
        console.log("Dispatched bind")
        console.log("Game is", this.game)
    }

    get game() {
        return store.state.games;
    }

}
</script>

<style scoped>
.Tracker {
    display: grid;
    grid-template-columns: 30px 30px 30px;
    /*background-color: black;*/
}

.greyed {
    filter: opacity(25%);
}

.Crystal {
    grid-row: 1 / span 1;
    grid-column: 2 / span 1;
}

.Sword {
    grid-row: 1 / span 2;
    grid-column: 1 / span 1;
}

.Beetle {
    grid-column: 3 / span 1;
    grid-row: 1 / span 1;
}

/* Number on Item */
.Crystal, .Bottles, .Pouch {
    align-content: center;
    text-align: center;
    font-size: 30pt;
}

img {
    width: 30px;
}

</style>
