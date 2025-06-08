<template>
    <div id="Intermission">
        <div class="ImageOverlay"></div>
        <!-- <img src="../../../static/bingothonUKRAINELOGO_colours.png" id="logoWinter"> -->
        <img src="../../../static/logo-winter-wide.png" id="logoWinter" />
        <!-- <img src="../../../static/logo-summer-wide.png" id="logoSummer" /> -->
        <div id="host-bingo-text">Host Blackout Bingo</div>
        <!--        <div id="host-bingo-text">Raising Money for</div>-->
        <run-upcoming v-if="nextRun" id="ComingUpNext" :data="nextRun"></run-upcoming>
        <rotation></rotation>
        <info-storage-box id="ReaderAndMusic">
            <div v-if="hostsSpeakingDuringIntermission" class="Mic">
                <img src="../../../static/Mic.png" />
            </div>
            <DiscordVoiceDisplay
                v-if="hostsSpeakingDuringIntermission"
                voiceHighlightColor="var(--darker-main-color)"
            ></DiscordVoiceDisplay>
            <Music :useSmallVariant="hostsSpeakingDuringIntermission"></Music>
        </info-storage-box>

        <div class="HostingBingo">
            <HostBingo class="BingoBoard" id="Bingo-board" fontSize="20px"></HostBingo>
            <!--            <img id="PHLogo" src="../../../static/ProjectHope_Hands_ICON_RGB_KO.png">-->
        </div>
        <div :class="'ImageView ' + (showIntermissionImage ? 'PictureShown' : '')">
            <img v-if="showIntermissionImage" :src="intermissionImageUrl" />
        </div>
        <TwitchClipPlayer />
        <iframe v-if="!!intermissionVdoUrl" id="vdoPlayer" :src="intermissionVdoUrl"></iframe>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import Logo from './components/Logo.vue';
    import Rotation from './components/Rotation.vue';
    import { store } from '../../browser-util/state';
    import RunUpcoming from './components/RunUpcoming.vue';
    import { RunData } from '../../../speedcontrol-types';
    import InfoStorageBox from '../_misc/components/InfoStorageBox.vue';
    import DiscordVoiceDisplay from '../components/discordVoiceDisplay.vue';
    import HostBingo from '../components/hostBingo.vue';
    import Music from './components/Music.vue';
    import TwitchClipPlayer from './components/TwitchClipPlayer.vue';

    @Component({
        components: {
            Logo,
            Rotation,
            RunUpcoming,
            InfoStorageBox,
            Music,
            DiscordVoiceDisplay,
            HostBingo,
            TwitchClipPlayer
        }
    })
    export default class Intermission extends Vue {
        @Prop({ default: undefined })
        data: unknown;

        nextRun: RunData = null;
        showTwitchClip: boolean = false;
        twitchClipSlug: string = '';

        created() {
            this.refreshUpcomingRun();
        }

        mounted() {
            nodecg.listenFor('forceRefreshIntermission', this.refreshUpcomingRun);
            nodecg.listenFor('playTwitchClip', (slug: string) => {
                this.twitchClipSlug = slug;
                this.showTwitchClip = true;
                setTimeout(() => {
                    this.showTwitchClip = false;
                }, 60 * 1000);
            });
            nodecg.listenFor('stopTwitchClip', () => {
                this.showTwitchClip = false;
            });
        }

        refreshUpcomingRun() {
            const curRun = store.state.runDataActiveRun;
            const nextRun = store.state.runDataArray[this.findRunIndex(curRun) + 1];
            if (nextRun) {
                this.nextRun = nextRun;
            }
        }

        get hostsSpeakingDuringIntermission(): boolean {
            return store.state.hostsSpeakingDuringIntermission.speaking;
        }

        get showIntermissionImage(): boolean {
            return !!store.state.showThingsDuringIntermission.imageUrl;
        }

        get intermissionImageUrl(): string {
            return store.state.showThingsDuringIntermission.imageUrl;
        }

        get intermissionVdoUrl(): string | null {
            return store.state.showThingsDuringIntermission.vdoUrl;
        }

        findRunIndex(run: RunData): number {
            let curRunID = run.id;
            if (!curRunID) {
                return -1;
            }
            return store.state.runDataArray.findIndex((run) => run.id === curRunID);
        }
    }
</script>

<style>
    #Intermission {
        height: 1080px;
        overflow: hidden;
    }

    #logoWinter {
        position: absolute;
        left: 48px;
        top: 50px;
        width: 631px;
    }

    #logoSummer {
        position: absolute;
        left: 48px;
        top: 20px;
        width: 631px;
    }

    #ComingUpNext {
        position: absolute;
        left: 718px;
        top: 31px;
        width: 1172px;
        height: 199px;
        color: white;
    }

    #host-bingo-text {
        width: 100%;
        font-weight: 500;
        height: 60px;
        line-height: 60px;
        color: #fff;
        font-size: 41px;
        text-transform: uppercase;
        position: absolute;
        left: 105px;
        top: 237px;
    }

    #Rotation {
        left: 718px;
        top: 240px;
        width: 1172px;
        height: 660px;
        color: white;
    }

    #ReaderAndMusic {
        justify-content: flex-start;
        flex-direction: row;
        background-color: rgba(0, 0, 0, 0.3);
        left: 718px;
        top: 910px;
        width: 1172px;
        height: 60px;
        font-size: 30px;
    }

    .DiscordVoiceDisplay {
        left: 750px;
        top: 920px;
    }

    .Mic {
        /*background-color: var(--lighter-main-color);*/
        top: 910px;
        height: 60px;
        padding: 5px;
    }

    .Mic > img {
        top: 910px;
        height: 60px;
        object-fit: contain;
    }

    .Music {
        position: absolute;
    }

    body {
        background: linear-gradient(-128deg, var(--gradient-light) 0, var(--gradient-dark) 100%) 100% no-repeat fixed;
        /* background-image: url("../../../static/bg-new.jpg"); */
    }

    .CardPlaceholder {
        position: absolute;
        top: 350px;
        left: 0px;
        height: 650px;
        width: 650px;
        background-color: var(--container-background-color);
    }

    .HostingBingo {
        position: absolute;
        color: #fff;
        top: 315px;
        height: 670px;
        width: 670px;
        font-size: 50px;
        left: 20px;
    }

    .ImageOverlay {
        position: absolute;
        top: 255px;
        left: 1px;
        width: 712px;
        height: 135px;
        background-image: url(http://localhost:9090/bundles/bingothon-layouts/graphics/js/../img/snowbanner-5127a2773ddbe60639022ef42942cc78.png);
        background-size: cover;
        background-repeat: no-repeat;
        z-index: 1;
    }

    .HostingBingo > .BingoBoard {
        height: 670px;
        width: 670px;
        position: relative;
    }

    #PHLogo {
        height: 670px;
        width: 670px;
        position: relative;
    }

    .ImageView {
        position: absolute;
        top: 300px;
        height: 670px;
        width: 670px;
        left: 33px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .ImageView.PictureShown {
        background: rgba(0, 0, 0, 0.7);
    }

    .ImageView > img {
        max-width: 100%;
        max-height: 100%;
    }

    #twitchClipEmbed {
        position: absolute;
        left: 718px;
        top: 240px;
        width: 1172px;
        height: 660px;
    }

    #vdoPlayer {
        position: absolute;
        left: 718px;
        top: 240px;
        width: 1172px;
        height: 660px;
        z-index: 100;
    }
</style>
