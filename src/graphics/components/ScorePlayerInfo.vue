<!-- This component handles displays each player's information within a team. -->
<!-- This is added dynamically to the PlayerContainer component when we need to show this. -->
<!-- It is initialised with most info, it only listens to nodecg-speedcontrol for finish times. -->

<template>
    <div class="FlexContainer PlayerInfoBox" :class="{ ReverseOrder: reverseOrder }" :style="{ height: height, '--container-height': height }">
        <div class="CurrentIcon FlexContainer">
            <transition name="fade">
                <div class="PronounsContainer" v-if="show && pronouns" key="pronuns">
                    <text-fit :text="pronouns"></text-fit>
                </div>
                <img v-else :key="currentIcon" :src="currentIcon" />
            </transition>
        </div>
        <div class="PlayerName">
            <transition name="fade">
                <text-fit :key="text" :text="text" :align="reverseOrder ? 'right' : 'left'"></text-fit>
            </transition>
        </div>
        <div v-if="showSound" class="Sound">
            <img :src="'/bundles/bingothon-layouts/static/music-note.png'" />
        </div>
        <div v-if="!!player.discordProfileUrl" class="DiscordIcon FlexContainer">
            <transition name="fade">
                <div :key="player.discordProfileUrl" class="AvatarContainer">
                    <img :src="player.discordProfileUrl" />
                    <div class="MicIcon FlexContainer" :style="{ opacity: discordIsSpeaking ? 1 : 0 }" >
                        <font-awesome-icon :icon="micIcon" :style="{ color: 'white' }"></font-awesome-icon>
                    </div>
                </div>
            </transition>
        </div>
        <div v-if="!!playerCountry" class="Flag FlexContainer">
            <transition name="fade">
                <img
                    :key="playerCountry"
                    :style="{ visibility: showFlag ? 'visible' : 'hidden' }"
                    :src="getPlayerFlag(playerCountry)"
                />
            </transition>
        </div>
        <div class="FlexContainer PlayerScore">
            {{ player.score }}
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { store } from '@/browser-util/state';
    import TextFit from '../helpers/text-fit.vue';
import { ScorePlayers } from 'schemas/scorePlayers';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';

    const playerSoloImg = require('../_misc/player-solo.png');
    const twitchIconImg = require('../_misc/twitch-icon.png');

    @Component({
        components: {
            TextFit,
            FontAwesomeIcon
        }
    })
    export default class ScorePlayerInfo extends Vue {
        @Prop({ default: -1 })
        playerIndex: number;

        @Prop({ default: true })
        showFlag: boolean;

        @Prop({ default: true })
        showColor: boolean;

        @Prop({ default: '55px' })
        height: string;

        @Prop({ default: false })
        reverseOrder: boolean;

        @Prop({ default: false })
        hideSoundIcon: boolean;

        @Prop({ default: false })
        hideFinishTime: boolean;

        @Prop({ default: false })
        hideScore: boolean;

        get player(): ScorePlayers[0] {
            return store.state.scorePlayers[this.playerIndex];
        }

        get playerCountry(): string {
            return "de"; // TODO
        }

        get show(): boolean {
            return store.state.playerAlternate;
            // return true;
        }

        get currentIcon(): any {
            if (this.show) {
                return playerSoloImg;
            } else {
                return twitchIconImg;
            }
        }

        get text(): string {
            if (this.show) {
                return this.player.displayName;
            } else {
                return '/' + this.player.twitch;
            }
        }

        get pronouns(): string {
            if (this.player.pronouns) {
                if (!this.player.pronouns.includes(',')) {
                    return this.player.pronouns.toString();
                }
                if (this.player.pronouns.includes('he/him') && this.player.pronouns.includes('they/them')) {
                    return 'he/them';
                }
                if (this.player.pronouns.includes('she/her') && this.player.pronouns.includes('they/them')) {
                    return 'she/them';
                }
                return 'they/them';
            }
            return '';
        }

        get showSound(): boolean {
            return this.playerIndex == store.state.soundOnTwitchStream && !this.hideSoundIcon;
        }

        getPlayerFlag(rawFlag: string | undefined): string {
            return `/bundles/bingothon-layouts/static/flags/${rawFlag}.png`;
        }

        get micIcon() {
            return faMicrophone;
        }

        get discordIsSpeaking(): boolean {
            return !!store.state.voiceActivity.members.find(member => member.name == this.player.discord)?.isSpeaking;
        }
    }
</script>

<style>
    @import './medals.css';

    .PlayerInfoBox {
        /*Summer background-image: linear-gradient(var(--lighter-main-color), var(--darker-main-color));*/
        background-image: linear-gradient(#6d001d, #280000);
        color: var(--font-color);
        padding: 7px;
        font-weight: 500;
        font-size: 30px;
    }

    .PlayerInfoBox.ReverseOrder {
        flex-direction: row-reverse;
    }

    .PlayerInfoBox > .CurrentIcon {
        height: 100%;
        width: calc(var(--container-height) * 1.5);
        text-align: left;
        position: relative;
    }

    .PlayerInfoBox > .CurrentIcon > img {
        height: 100%;
        position: absolute;
        filter: invert(100%);
    }

    .PlayerInfoBox > .CurrentIcon > .PronounsContainer {
        font-size: 60%;
        /* color: #f3ad00; */
        /* border: 1px solid #f3ad00; */
        /* background-color: #f3ad00; */
        bottom: 1px;
        color: white;
        height: calc(var(--container-height) * 0.75);
        position: relative;
        width: calc(var(--container-height) * 2);
    }

    .PlayerInfoBox > .PlayerName {
        flex-grow: 1;
        flex-shrink: 0;
        height: 100%;
        margin-left: 10px;
        margin-right: 10px;
        justify-content: flex-start;
        position: relative;
    }

    /*.PlayerInfoBox > .PlayerName > div > .FinishTime {
  color: var(--font-colour);
}*/

    .PlayerInfoBox > .Flag {
        height: 100%;
        width: calc(var(--container-height) * 1.9);
        justify-content: flex-end;
        position: relative;
        margin-right: 15px;
    }

    .PlayerInfoBox.ReverseOrder > .Flag {
        justify-content: flex-start;
    }

    .PlayerInfoBox > .Flag > img {
        visibility: visible;
        position: absolute;
        border: 1px solid white;
        height: calc(100% - 2px);
    }

    .PlayerInfoBox > .DiscordIcon > .AvatarContainer > img {
        height: calc(var(--container-height) * 1);
        width: calc(var(--container-height) * 1);
        border-radius: 100%;
    }

    .PlayerInfoBox > .DiscordIcon > .AvatarContainer {
        position: relative;
        display: flex;
    }

    .PlayerInfoBox > .DiscordIcon > .AvatarContainer > .MicIcon {
        position: absolute;
        width: calc(var(--container-height) * 0.55);
        height: calc(var(--container-height) * 0.55);
        top: calc(var(--container-height) * -0.14);
        right: calc(var(--container-height) * -0.14);
        background-color: blue;
        border-radius: 100%;
        font-size: 41%;

        opacity: 1;
    }

    .PlayerInfoBox > .BingoColor {
        justify-content: center;
        margin-left: 14px;
        font-size: 40px;
        border-radius: 10%;
        border: 1px white solid;
        box-sizing: content-box;
    }

    .PlayerInfoBox > .Sound > img {
        width: 30px;
    }

    /* Bingosync styled gradients */
    .PlayerInfoBox > .BingoColor.bingo-green {
        background-image: var(--bingo-color-green);
    }

    .PlayerInfoBox > .BingoColor.bingo-red {
        background-image: var(--bingo-color-red);
    }

    .PlayerInfoBox > .BingoColor.bingo-orange {
        background-image: var(--bingo-color-orange);
    }

    .PlayerInfoBox > .BingoColor.bingo-blue {
        background-image: var(--bingo-color-blue);
    }

    .PlayerInfoBox > .BingoColor.bingo-purple {
        background-image: var(--bingo-color-purple);
    }

    .PlayerInfoBox > .BingoColor.bingo-pink {
        background-image: var(--bingo-color-pink);
    }

    .PlayerInfoBox > .BingoColor.bingo-brown {
        background-image: var(--bingo-color-brown);
    }

    .PlayerInfoBox > .BingoColor.bingo-teal {
        background-image: var(--bingo-color-teal);
    }

    .PlayerInfoBox > .BingoColor.bingo-navy {
        background-image: var(--bingo-color-navy);
    }

    .PlayerInfoBox > .BingoColor.bingo-yellow {
        background-image: var(--bingo-color-yellow);
    }

    .PlayerInfoBox > .PlayerScore {
        width: calc(var(--container-height) * 1.2);
        height: 100%;
        font-size: 125%;
    }
</style>
