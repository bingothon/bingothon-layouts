<template>
    <div id="RotatingLogos">
        <div id="LogoWrapper">
            <transition name="fade" mode="out-in">
                <img :key="logo" :src="logo" />
            </transition>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';

    const wide = require('../logo-winter-wide.png');
    const fhLogo = require('../BingothonWinterNewFredHutch.png');

    @Component({})
    export default class RotatingLogos extends Vue {
        logo: string = wide;
        private nextLogo: string = fhLogo;

        mounted(): void {
            this.preloadImages();
            this.changeLogo();
        }

        private preloadImages(): void {
            const img1 = new Image();
            img1.src = wide;
            const img2 = new Image();
            img2.src = fhLogo;
        }

        changeLogo(): void {
            // Preload the next image before changing
            this.nextLogo = this.logo !== wide ? wide : fhLogo;
            const img = new Image();
            img.onload = () => {
                this.logo = this.nextLogo;
            };
            img.src = this.nextLogo;

            const time = this.logo === fhLogo ? 30 : 30;
            setTimeout(this.changeLogo, time * 1000);
        }
    }
</script>

<style scoped>
    #RotatingLogos {
        padding-right: 7px;
        padding-left: 7px;
    }

    #LogoWrapper {
        position: relative;
        top: 50%;
        width: 230px;
    }

    #LogoWrapper > img {
        position: absolute;
        max-width: 100%;
        transform: translateY(-50%);
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.3s ease-in-out;
    }

    .fade-enter {
        opacity: 0;
    }

    .fade-leave-to {
        opacity: 0;
    }

    .fade-enter-to,
    .fade-leave {
        opacity: 1;
    }
</style>
