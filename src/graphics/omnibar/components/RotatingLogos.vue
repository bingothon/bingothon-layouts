<template>
    <div id="RotatingLogos">
        <div id="LogoWrapper">
            <transition name="fade">
                <img :key="logo" :src="logo" />
            </transition>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';

    const wide = require('../../../../static/bingothonlong5years.png');
    const fhLogo = require('../BingothonMSF.png');

    @Component({})
    export default class RotatingLogos extends Vue {
        logo: string = wide;

        mounted(): void {
            this.changeLogo();
        }

        changeLogo(): void {
            this.logo = this.logo !== wide ? wide : fhLogo;
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
        transition: opacity 1s;
    }
    .fade-enter,
    .fade-leave-to {
        opacity: 0;
    }
</style>
