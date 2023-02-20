<template>
    <div id="Omnibar">
        <rotating-logos></rotating-logos>
        <divider></divider>
        <total></total>
        <divider></divider>
        <ticker></ticker>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import RotatingLogos from './components/RotatingLogos.vue'
    import Total from './components/DonationTotal.vue'
    import Ticker from './components/Ticker.vue'
    import Divider from './components/Divider.vue'

    @Component({
        components: {
            RotatingLogos,
            Total,
            Ticker,
            Divider,
        },
    })
    export default class Omnibar extends Vue {}
</script>

<style>
    #Omnibar {
        position: fixed;
        display: flex;
        width: 1920px;
        height: 80px;
        justify-content: flex-start;
        color: white;
        background: linear-gradient(-128deg, var(--gradient-light) 0, var(--gradient-dark) 100%) 100% no-repeat fixed;
    }
</style>
