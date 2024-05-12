<template>
    <div class="GameContainer FlexContainer" style="flex-direction: column; row-gap: 8px">
        <!-- Title in the middle -->
        <div class="GameDetails FlexContainer">
            <div class="GameName FlexContainer">{{ gameName }}</div>
            <!-- Other information on the middle bottom -->
            <div class="GameExtra FlexContainer" style="flex-direction: column; padding: 0 4px">
                <!-- Game System Chip and Category in the same row -->
                <div class="FlexContainer" style="column-gap: 8px">
                    <div v-if="gameSystem" class="GameChip FlexContainer">
                        <img
                            v-if="gameSystemImage"
                            :src="gameSystemImage"
                            alt="Game System Logo"
                            class="gameSystemLogo"
                        />
                        <span>{{ gameSystem }}</span>
                    </div>

                    <!-- Added Category next to the Game System -->
                    <div class="GameChip FlexContainer">
                        <span>{{ gameCategory }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    type ColorEnum = 'pink' | 'red' | 'orange' | 'brown' | 'yellow' | 'green' | 'teal' | 'blue' | 'navy' | 'purple';
    import InlineSvg from './InlineSvg.vue';
    import { Component, Vue } from 'vue-property-decorator';
    import { store } from '@/browser-util/state';
    import { RunDataPlayer } from 'speedcontrol-types';

    import gameSystemImages from '../../../static/assets/game-systems/game-system-images-manifest.json';

    @Component({
        components: {
            InlineSvg
        }
    })
    export default class TestGameContainer extends Vue {
        playerIndex = 0;

        get gameName(): string {
            return store.state.runDataActiveRun.game;
        }

        get gameCategory(): string {
            return store.state.runDataActiveRun.category;
        }

        get gameSystem(): string {
            return store.state.runDataActiveRun.system;
        }

        get playerColors(): Array<ColorEnum> {
            return store.state.bingoboardMeta.playerColors;
        }

        get players(): RunDataPlayer[] {
            let allPlayers: RunDataPlayer[] = [];

            for (let team of store.state.runDataActiveRun.teams) {
                for (let player of team.players) {
                    allPlayers.push(player);
                }
            }

            return allPlayers;
        }

        get gameSystemImage(): string | undefined {
            const imagePath = gameSystemImages[this.gameSystem.toLocaleLowerCase()];
            if (imagePath) {
                return require('../../../static/assets/game-systems/' + imagePath);
            }
            return undefined;
        }
    }
</script>

<style>
    .GameDetails {
        align-content: center;
        align-items: center;
        flex-direction: column;
        text-align: center;
    }

    .GameDetails > .GameName {
        font-size: 30px;
        color: white;
    }

    .GameExtra img {
        margin-left: 5px;
        max-width: 100px !important;
        max-height: 19px !important;
    }

    .GameContainer img {
        max-width: 60px;
        max-height: 60px;
    }

    .gameSystemLogo {
        width: auto; /* Adjust size as needed */
        height: 20px; /* Adjust size as needed */
        margin: 5px;
    }

    .GameChip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        align-content: center;
        text-align: center;
        padding: 3px 4px;
        background-color: rgba(220, 240, 255, 0.9); /* Light blueish, slightly transparent */
        border-radius: 2px;
        font-size: 18px;
        color: #333;
        border: 1px solid rgba(180, 230, 255, 0.7); /* Slightly blueish border for that 'frozen' feel */

        /* Ice-like gradient background using SVG */
        background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="iceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(240, 255, 255, 0.7); stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(200, 240, 255, 0.9); stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23iceGradient)" /></svg>');
        box-shadow: 0px 0px 5px 2px rgba(200, 240, 255, 0.3); /* Subtle glow to add depth */
    }
</style>
