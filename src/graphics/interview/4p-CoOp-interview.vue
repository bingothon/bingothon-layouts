<template>
    <div class="Interview">
        <img src="../../../static/logo-summer-wide.png" id="logo" />
        <div id="fillvoice" class="flexContainer"></div>
        <player-team-container id="ptc0" teamIndex="0" height="40px"></player-team-container>
        <player-team-container id="ptc1" teamIndex="1" height="40px"></player-team-container>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <bingo-board id="Bingo-board" fontSize="20px"></bingo-board>
        <discord-voice-display
            id="discord-voice"
            iconHeight="40px"
            nameWidth="114px"
            maxUserCount="16"
        ></discord-voice-display>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import TestTimerContainer from '../components/timerContainer.vue'
    import TestGameContainer from '../components/gameContainer.vue'
    import BingoBoard from '../components/bingoboard.vue'
    import PlayerInfo from '../components/playerInfo.vue'
    import TeamInfo from '../components/teamInfo.vue'
    import PlayerTeamContainer from '../components/playerTeamContainer.vue'
    import DiscordVoiceDisplay from '../components/discordVoiceDisplay.vue'

    @Component({
        components: {
            BingoBoard,
            TestGameContainer,
            PlayerInfo,
            TeamInfo,
            PlayerTeamContainer,
            TestTimerContainer,
            DiscordVoiceDisplay,
        },
    })
    export default class Interview extends Vue {}
</script>

<style scoped>
    .Interview {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 1935px;
        height: 1090px;
        background: linear-gradient(var(--darker-main-color), var(--lighter-main-color));
    }
    #discord-voice {
        position: absolute;
        top: 500px;
        left: 1330px;
        width: 500px;
        height: 400px;
        background-color: var(--container-background-color);
    }
    #logo {
        position: absolute;
        left: 690px;
        top: 10px;
        width: 568px;
        height: 200px;
    }
    #ptc0 {
        position: absolute;
        top: 500px;
        left: 90px;
        width: 500px;
    }
    #ptc1 {
        position: absolute;
        top: 750px;
        left: 90px;
        width: 500px;
    }
    #Bingo-board {
        position: absolute;
        top: 500px;
        left: 710px;
        width: 500px;
        height: 500px;
    }
    #game {
        position: absolute;
        top: 225px;
        left: 460px;
        width: 1000px;
        height: 100px;
    }
    #game > .GameContainer > .GameExtra {
        color: #484848;
    }
    #timer {
        position: absolute;
        top: 325px;
        left: 710px;
        width: 500px;
        height: 150px;
    }
</style>
