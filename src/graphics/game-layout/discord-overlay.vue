<template>
    <div>
        <discord-voice-display id="discord" maxUserCount="8"></discord-voice-display>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { store } from '../../browser-util/state'
    import TestTimerContainer from '../components/timerContainer.vue'
    import TestGameContainer from '../components/gameContainer.vue'
    import BingoBoard from '../components/bingoboard.vue'
    import PlayerInfo from '../components/playerInfo.vue'
    import TeamInfo from '../components/teamInfo.vue'
    import PlayerTeamContainer from '../components/playerTeamContainer.vue'
    import DiscordVoiceDisplay from '../components/discordVoiceDisplay.vue'
    import TwitchPlayer from '../components/twitchStreamPlaceholder.vue'
    import { RunDataTeam } from '../../../speedcontrol-types'

    @Component({
        components: {
            BingoBoard,
            TestGameContainer,
            PlayerInfo,
            TeamInfo,
            PlayerTeamContainer,
            TestTimerContainer,
            DiscordVoiceDisplay,
            TwitchPlayer,
        },
    })
    export default class GameLayout extends Vue {
        get teams(): RunDataTeam[] {
            return store.state.runDataActiveRun.teams
        }
    }
</script>

<style scoped>
    body {
        background: linear-gradient(-128deg, var(--gradient-light) 0, var(--gradient-dark) 100%) 100% no-repeat fixed;
    }

    #discord {
        top: 0px;
        width: 1920px;
    }

    #stream1 {
        position: absolute;
        top: 175px;
        left: 360px;
        width: 1200px;
        height: 675px;
    }
    .bg {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 1920px;
        height: 1080px;
        background: linear-gradient(var(--darker-main-color), var(--lighter-main-color));
    }
    .just-dance-video-placeholder {
        position: absolute;
        top: 300px;
        left: 50px;
        width: 875px;
        height: 495px;
        background: #333;
    }

    .discord-videocall-placeholder {
        position: absolute;
        top: 300px;
        left: 995px;
        width: 880px;
        height: 495px;
        background: #3c3c3c;
    }

    #logo {
        position: absolute;
        left: 630px;
        top: 42px;
        width: 666px;
        height: 200px;
    }
    #pi1 {
        position: absolute;
        top: 795px;
        left: 50px;
        width: 500px;
        background-image: linear-gradient(#373d6f, #2a2a54);
        color: var(--font-color);
    }

    #pi2 {
        position: absolute;
        top: 795px;
        left: 1361px;
        width: 500px;
        background-image: linear-gradient(#373d6f, #2a2a54);
        color: var(--font-color);
    }
    #name {
        top: 850px;
        font-size: 60px;
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
        background-image: linear-gradient(#373d6f, #2a2a54);
        color: var(--font-color);
        font-size: 40px;
    }

    #infoIVW2 {
        position: absolute;
        top: 900px;
        left: 1300px;
        height: 50px;
        width: 500px;
        background-image: linear-gradient(#373d6f, #2a2a54);
        color: var(--font-color);
        font-size: 40px;
    }
    #nameIVW1 {
        margin-left: 10px;
    }
    #nameIVW2 {
        margin-left: 10px;
    }
    #pe-logo > img {
        object-fit: contain;
        height: 100px;
    }
    #pe-logo {
        position: absolute;
        left: 800px;
    }
    #infotext {
        position: absolute;
        left: 0px;
    }
</style>
