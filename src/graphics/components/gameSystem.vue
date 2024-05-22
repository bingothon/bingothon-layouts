<template>
    <div id="GameSystem" class="GameSystem Chip">
        <img v-if="gameSystemImage" :src="gameSystemImage" />
        <span v-if="!gameSystemImage || pathsAndLogos[gameSystem.toLocaleLowerCase()].textNeeded" class="ChipText">
            <textFit :text="gameSystem" />
        </span>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import TextFit from '@/helpers/text-fit.vue';

    @Component({
        components: { TextFit }
    })
    export default class GameSystem extends Vue {
        @Prop({ default: '' })
        gameSystem: string;

        pathsAndLogos: { [key: string]: { textNeeded: boolean; logoPath: string } } = {
            atari2600: { logoPath: 'images/atari2600.png', textNeeded: true },
            atari7800: { logoPath: 'images/atari7800.png', textNeeded: true },
            ds: { logoPath: 'images/ds.png', textNeeded: true },
            gba: { logoPath: 'images/gbadvance.png', textNeeded: true },
            gb: { logoPath: 'images/gbclassic.png', textNeeded: true },
            gbc: { logoPath: 'images/gbcolor.png', textNeeded: true },
            gcn: { logoPath: 'images/gcn.png', textNeeded: true },
            n64: { logoPath: 'images/n64.png', textNeeded: true },
            nes: { logoPath: 'images/nes.png', textNeeded: true },
            pc: { logoPath: 'images/pc.svg', textNeeded: true },
            pcengine: { logoPath: 'images/pcengine.png', textNeeded: true },
            playstation: { logoPath: 'images/ps1.png', textNeeded: true },
            'playstation 2': { logoPath: 'images/ps2.png', textNeeded: true },
            'playstation 3': { logoPath: 'images/ps3.svg', textNeeded: true },
            'playstation 4': { logoPath: 'images/ps4.png', textNeeded: true },
            psp: { logoPath: 'images/psp.png', textNeeded: true },
            psvita: { logoPath: 'images/psvita.png', textNeeded: true },
            segadreamcast: { logoPath: 'images/segadreamcast.png', textNeeded: true },
            segagamegear: { logoPath: 'images/segagamegear.png', textNeeded: true },
            segagenesis: { logoPath: 'images/segagenesis.png', textNeeded: true },
            segamastersystem: { logoPath: 'images/segamastersystem.png', textNeeded: true },
            segamegadrive: { logoPath: 'images/segamegadrive.png', textNeeded: true },
            segasaturn: { logoPath: 'images/segasaturn.png', textNeeded: true },
            snes: { logoPath: 'images/snes.png', textNeeded: true },
            switch: { logoPath: 'images/switch.svg', textNeeded: true },
            wii: { logoPath: 'images/wii.png', textNeeded: false },
            'wii u': { logoPath: 'images/wiiu.png', textNeeded: false },
            xbox360: { logoPath: 'images/xbox360.png', textNeeded: true },
            xbox: { logoPath: 'images/xboxclassic.png', textNeeded: true },
            xboxone: { logoPath: 'images/xboxone.png', textNeeded: true },
            zxspectrum: { logoPath: 'images/zxspectrum.png', textNeeded: true }
        };

        get gameSystemImage(): string | undefined {
            const imagePath = this.pathsAndLogos[this.gameSystem.toLocaleLowerCase()].logoPath;
            if (imagePath) {
                return require('../../../static/game-systems/' + imagePath);
            }
            return;
        }
    }
</script>

<style scoped>
    #GameSystem {
        display: flex;
        align-items: center;
    }

    .GameSystem img {
        width: auto;
        max-width: 100px;
        height: 25px;
    }
</style>
