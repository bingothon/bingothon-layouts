<template>
    <div class="Tracker">
        <div :class="`Sword ${!game.sword ? 'greyed' : ''}`">
            <img :src="`${basePath}sword_${game.sword || 0}_new.png`">
        </div>
        <div :class="`Crystal ${!game.crystals ? 'greyed' : ''}`">
            <img :src="`${basePath}crystal.png`">
            <span :class="`Counter`"> {{ game.crystals || 0 }} </span>
        </div>
        <div :class="`Mitts ${!game.mitts ? 'greyed' : ''}`">
            <img :src="`${basePath}mitts_${game.mitts || 0}.png`">
        </div>
        <div :class="`Scale ${!game.scale ? 'greyed' : ''}`">
            <img :src="`${basePath}scale.png`">
        </div>
        <div :class="`Earrings ${!game.earrings ? 'greyed' : ''}`">
            <img :src="`${basePath}earrings.png`">
        </div>
        <div :class="`Bottles ${!game.bottles ? 'greyed' : ''}`">
            <img :src="`${basePath}bottle.png`">
            <span :class="`Counter`"> {{ game.bottles || 0 }} </span>
        </div>
        <div :class="`Beetle ${!game.beetle ? 'greyed' : ''}`">
            <img :src="`${basePath}beetle_${game.beetle || 0}.png`">
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
            <span :class="`Counter`"> {{ game.pouch || 0 }} </span>
        </div>
        <div :class="`Wallet`">
            <img :src="`${basePath}wallet_${game.wallet || 0}.png`">
        </div>
        <div :class="`SoT ${!game.sot ? 'greyed' : ''}`">
            <img :src="`${basePath}stone_of_trials.png`">
        </div>
        <div :class="`FC ${!game.fcsong ? 'greyed' : ''}`">
            <img :src="`${basePath}harpfc.png`">
        </div>
        <div :class="`NW ${!game.nwsong ? 'greyed' : ''}`">
            <img :src="`${basePath}harpnw.png`">
        </div>
        <div :class="`DP ${!game.dpsong ? 'greyed' : ''}`">
            <img :src="`${basePath}harpdp.png`">
        </div>
        <div :class="`SotH ${!game.sothsong ? 'greyed' : ''}`">
            <img :src="`${basePath}harpsoth.png`">
            <span :class="`Counter`"> {{ game.sothsong || 0 }} </span>
        </div>
        <div :class="`BotG ${!game.botgsong ? 'greyed' : ''}`">
            <img :src="`${basePath}harpbotg.png`">
        </div>
        <div :class="`Harp ${!game.harp ? 'greyed' : ''}`">
            <img :src="`${basePath}harp.png`">
        </div>
        <div :class="`SV ${!game.skyview ? 'greyed' : ''}`">
            <img :src="`${basePath}dungeon_sv.png`">
            <span class="Name"> SV </span>
        </div>
        <div :class="`ET ${!game.earthtemple ? 'greyed' : ''}`">
            <img :src="`${basePath}dungeon_et.png`">
            <span class="Name"> ET </span>
        </div>
        <div :class="`LMF ${!game.lmf ? 'greyed' : ''}`">
            <img :src="`${basePath}dungeon_lmf.png`">
            <span class="Name"> LMF </span>
        </div>
        <div :class="`AC ${!game.ancientcistern ? 'greyed' : ''}`">
            <img :src="`${basePath}dungeon_ac.png`">
            <span class="Name"> AC </span>
        </div>
        <div :class="`SSH ${!game.sandship ? 'greyed' : ''}`">
            <img :src="`${basePath}dungeon_ssh.png`">
            <span class="Name"> SSH </span>
        </div>
        <div :class="`FS ${!game.firesanctuary ? 'greyed' : ''}`">
            <img :src="`${basePath}dungeon_fs.png`">
            <span class="Name"> FS </span>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {store} from "../../browser-util/state";
import {Games} from "../../../types";
import {TrackerData} from "../../../schemas";

@Component({
    components: {}
})

export default class Tracker extends Vue {
    @Watch('trackerData')
    onTrackerDataChange(): void {
        console.log('watcher function for trackers')
        this.updateTrackers()
    }

    @Prop({required: true, default: 1})
    playerNumber: string;// actually a number but who cares about types? shrug

    basePath = '/bundles/bingothon-layouts/static/tracker/skyward-sword/'

    mounted() {
        this.updateTrackers();
    }

    get game() : Games {
        let player = parseInt(this.playerNumber)
        switch (player) {
            case 4:
                return store.state.gameP4
            case 3:
                return store.state.gameP3
            case 2:
                return store.state.gameP2
            case 1:
            default:
                return store.state.gameP1
        }
    }

    get trackerData(): TrackerData {
        return store.state.trackerData;
    }

    updateTrackers() {
        console.log('update trackers')
        let player = parseInt(this.playerNumber);
        switch (player){
            case 4:
                store.dispatch("unbindGameP4")
                store.dispatch("bindGameP4")
                break
            case 3:
                store.dispatch("unbindGameP3")
                store.dispatch("bindGameP3")
                break
            case 2:
                store.dispatch("unbindGameP2")
                store.dispatch("bindGameP2")
                break
            case 1:
            default:
                store.dispatch("unbindGameP1")
                store.dispatch("bindGameP1")
        }
    }

}
</script>

<style scoped>
.Tracker {
    display: grid;
    grid-template-columns: 40px 40px 40px 40px;
}

.greyed {
    filter: opacity(25%);
}

.Sword {
    grid-row: 1 / span 2;
    grid-column: 1 / span 1;
}

/* Number on Item */
.Crystal, .Bottles, .Pouch, .SotH {
    position: relative;
    align-content: center;
    text-align: center;
    font-size: 18pt;
}

.SV, .ET, .LMF, .AC, .SSH, .FS {
    position: relative;
    align-content: center;
    text-align: center;
    font-size: 14pt;
}

.Name {
    position: absolute;
    transform: translate(-50%, -60%);
    left: 50%;
    top: 50%;
}

.Counter {
    position: absolute;
    transform: translate(-50%, -60%);
    left: 50%;
    top: 50%;
    -webkit-text-stroke: 1px white;
}

img {
    width: 40px;
}

</style>
