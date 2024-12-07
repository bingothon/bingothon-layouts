<template>
    <div id="GameSystem" class="GameSystem Chip">
        <img v-if="gameSystemImage" :src="gameSystemImage" />
        <span v-if="!gameSystemImage || pathsAndLogos[gameSystem.toLocaleLowerCase()].textNeeded" class="ChipText">
            {{ gameSystem }}
        </span>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import TextFit from '@/helpers/text-fit.vue';
    import { pathsAndText } from '@/graphics/_misc/consoleLogosPaths';

    @Component({
        components: { TextFit }
    })
    export default class GameSystem extends Vue {
        @Prop({ default: '' })
        gameSystem: string;

        get pathsAndLogos() {
            return pathsAndText;
        }

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
