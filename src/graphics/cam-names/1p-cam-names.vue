<template>
    <div class="Cam-Names">
        <player-info id="pi1" playerIndex="0" height="45px" show-color="false"></player-info>
    </div>
</template>

<script lang="ts">
    import PlayerInfo from '../components/playerInfo.vue';
    import { Component, Vue } from 'vue-property-decorator';

    @Component({
        components: {
            PlayerInfo
        }
    })
    export default class CamNames extends Vue {}
</script>

<style scoped>
    #pi1 {
        position: absolute;
        top: 940px;
        left: 480px;
        width: 960px;
    }
</style>
