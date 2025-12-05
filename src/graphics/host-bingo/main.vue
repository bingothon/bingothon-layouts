<template>
    <div id="HostBingo">
        <div id="HostingBingo">
            <HostBingo dashboard="true" fontSize="25px"></HostBingo>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import HostBingo from '../components/hostBingo.vue';

    @Component({
        components: {
            HostBingo
        }
    })
    export default class HostingBingo extends Vue {}
</script>

<style>
    body {
        background-color: black;
    }

    button {
        font-size: 15px;
        text-align: center;
        align-content: center;
    }

    #HostingBingo {
        width: 100%;
        margin-bottom: 10px;
        padding-bottom: 80px;
    }

    #HostingBingo > .BingoBoard {
        width: 100%;
        padding-bottom: 100%;
        position: relative;
    }
</style>
