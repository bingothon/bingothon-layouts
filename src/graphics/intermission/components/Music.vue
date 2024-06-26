<template>
    <transition name="fade">
        <div
            :key="name"
            v-if="show"
            class="Music FlexContainer"
            :style="{
                width: `${useSmallVariant ? '450' : '1172'}px`,
                left: `${useSmallVariant ? '730' : '0'}px`
            }"
        >
            <div class="MCat">
                <img src="../../../../static/music.png" />
            </div>
            <div class="NameContainer" ref="nameContainer">
                <div ref="songName" class="Name" :class="{ Animation1: scrollingEffect }">
                    {{ name }}
                </div>
                <div v-if="scrollingEffect" class="Name Animation2">
                    {{ name }}
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
    import { store } from '../../../browser-util/state';
    import { SongData } from '../../../../schemas';
    import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

    @Component({})
    export default class Music extends Vue {
        show: boolean = false;
        name: string = '';
        scrollingEffect: boolean = false;
        @Prop()
        useSmallVariant: boolean;

        mounted() {
            store.watch((state) => state.songData, this.onSongDataUpdate, { immediate: true });
            //this.onSongDataUpdate({title: "Epic bingothon Rap Remix - Flo & Tr1cks", playing: true});
        }

        onSongDataUpdate(newSong: SongData | undefined) {
            if (newSong && newSong.playing) {
                this.name = newSong.title;
                this.show = true;
                this.maybeInitScrollingEffect();
            } else {
                this.show = false;
            }
        }

        maybeInitScrollingEffect() {
            // disable scrolling effect until we know if it's needed
            this.scrollingEffect = false;
            Vue.nextTick(() => {
                // wait for transition
                const nameContainer = this.$refs.nameContainer as Element;
                const songName = this.$refs.songName as Element;
                // if the name is bigger than the container we need to scroll
                this.scrollingEffect = songName.clientWidth > nameContainer.clientWidth;
                //console.log('container:', nameContainer, 'name', songName);
            });
        }

        @Watch('useSmallVariant')
        checkSize() {
            if (this.show) {
                this.maybeInitScrollingEffect();
            }
        }
    }
</script>

<style scoped>
    .Music {
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height: 100%;
    }

    .MCat {
        box-sizing: border-box;
        height: 100%;
        padding: 5px;
    }

    .MCat > img {
        height: 100%;
        object-fit: contain;
    }

    .NameContainer {
        position: relative;
        flex: 1;
        margin: 0 15px;
        overflow: hidden;
        height: 100%;
        vertical-align: super;
        align-items: center;
        display: flex;
    }

    .NameContainer > .Name {
        position: absolute;
        overflow: hidden;
        white-space: nowrap;
    }

    .NameContainer > .Name.Animation1 {
        /* Make sure that this one reaches default position before the other one goes away to avoid flickering*/
        animation: music-marquee1 15s 200ms linear infinite;
    }

    .NameContainer > .Name.Animation2 {
        animation: music-marquee2 15s linear infinite;
    }

    @keyframes music-marquee1 {
        0% {
            transform: translateX(110%);
        }
        20% {
            transform: translateX(110%);
        }
        90% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(0);
        }
    }

    @keyframes music-marquee2 {
        0% {
            transform: translateX(0%);
        }
        20% {
            transform: translateX(0%);
        }
        90% {
            transform: translateX(-110%);
        }
        100% {
            transform: translateX(-110%);
        }
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 1s;
    }

    .fade-enter,
    .fade-leave-to {
        opacity: 0;
    }
</style>
