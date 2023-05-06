<template>
    <div class="Interview">
        <img id="logo" src="../../../static/logo-winter-wide.png" />
        <div class="flexContainer" id="fillcamCharity"></div>
        <div class="flexContainer" id="fillcamIVW1"></div>
        <div class="flexContainer" id="infoIVW1">
            <div id="nameIVW1">Floha</div>
        </div>
        <div class="flexContainer" id="fillcamIVW2"></div>
        <div class="flexContainer" id="infoIVW2">
            <div id="nameIVW2">Pikastroff</div>
        </div>
        <div class="flexContainer" id="info">
            <div id="infotext">
                <div id="name">Amitabha “Guppy” Gupta, Ph. D</div>
                <div id="occupation">Researcher at the Fred Hutchinson Research Center</div>
            </div>
            <div id="charity-logo">
                <img src="../../../static/fred_hutch_logo_brighter.png" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';

    @Component({
        components: {},
    })
    export default class Interview extends Vue {}
</script>

<style scoped>
    body {
        background: linear-gradient(-128deg, var(--gradient-light) 0, var(--gradient-dark) 100%) 100% no-repeat fixed;
    }

    .Interview {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 1920px;
        height: 1080px;
        background: linear-gradient(-128deg, var(--gradient-light) 0, var(--gradient-dark) 100%) 100% no-repeat fixed;
    }

    #fillcamCharity {
        position: absolute;
        top: 175px;
        left: 50px;
        width: 1200px;
        height: 675px;
        background-color: var(--container-background-color);
    }

    #fillcamIVW1 {
        position: absolute;
        top: 175px;
        left: 1300px;
        width: 500px;
        height: 281px;
        background-color: var(--container-background-color);
    }

    #fillcamIVW2 {
        position: absolute;
        top: 619px;
        left: 1300px;
        width: 500px;
        height: 281px;
        background-color: var(--container-background-color);
    }

    #logo {
        position: absolute;
        left: 590px;
        top: 10px;
        width: 626px;
        height: 150px;
    }

    #info {
        top: 850px;
        position: absolute;
        left: 50px;
        width: 1200px;
        height: 100px;
        background-image: linear-gradient(#429ff8, #002675);
        color: var(--font-color);
    }

    #name {
        top: 850px;
        font-size: 45px;
        margin-left: 10px;
    }

    #occupation {
        top: 910px;
        font-size: 20px;
        margin-left: 10px;
    }

    #infoIVW1 {
        position: absolute;
        top: 456px;
        left: 1300px;
        height: 50px;
        width: 500px;
        background-image: linear-gradient(#429ff8, #002675);
        color: var(--font-color);
        font-size: 40px;
    }

    #infoIVW2 {
        position: absolute;
        top: 900px;
        left: 1300px;
        height: 50px;
        width: 500px;
        background-image: linear-gradient(#429ff8, #002675);
        color: var(--font-color);
        font-size: 40px;
    }

    #nameIVW1 {
        margin-left: 10px;
    }

    #nameIVW2 {
        margin-left: 10px;
    }

    #charity-logo > img {
        object-fit: contain;
        height: 90px;
    }

    #charity-logo {
        position: absolute;
        left: 800px;
    }

    #infotext {
        position: absolute;
        left: 0px;
    }
</style>
