<template>
    <div class="Interview">
        <img src="../../../static/bingothonlong5years.png" id="logo" />
        <div id="fillvoice" class="flexContainer"></div>
        <div id="team-container" v-if="playerCount.length === 4 && teamCount.length === 2">
            <player-team-container
                v-for="teamIndex in teamCount"
                :key="teamIndex"
                class="team"
                :teamIndex="teamIndex"
                height="40px"
            ></player-team-container>
        </div>
        <div v-else id="player-container">
            <player-info
                v-for="playerIndex in playerCount"
                :key="playerIndex"
                class="player"
                :playerIndex="playerIndex"
                height="45px"
            ></player-info>
        </div>
        <test-game-container id="game"></test-game-container>
        <test-timer-container id="timer"></test-timer-container>
        <bingo-board id="Bingo-board" fontSize="20px"></bingo-board>
        <discord-interview id="discord-voice" iconHeight="150px" maxUserCount="6" nameWidth="250px"></discord-interview>
    </div>
</template>

<script lang="ts">
    import { store } from '../../browser-util/state';
    import { Component, Vue } from 'vue-property-decorator';
    import TestTimerContainer from '../components/timerContainer.vue';
    import TestGameContainer from '../components/gameContainer.vue';
    import BingoBoard from '../components/bingoboard.vue';
    import PlayerInfo from '../components/playerInfo.vue';
    import TeamInfo from '../components/teamInfo.vue';
    import PlayerTeamContainer from '../components/playerTeamContainer.vue';
    import DiscordInterview from '../components/discordInterview.vue';

    @Component({
        components: {
            BingoBoard,
            TestGameContainer,
            PlayerInfo,
            TeamInfo,
            PlayerTeamContainer,
            TestTimerContainer,
            DiscordInterview
        }
    })
    export default class Interview extends Vue {
        get playerCount(): number[] {
            let count = 0;
            const playerIndexes = [];
            store.state.runDataActiveRun.teams.forEach((t) => {
                t.players.forEach(() => {
                    playerIndexes.push(count);
                    count++;
                });
            });
            return playerIndexes;
        }

        get teamCount(): number[] {
            let count = 0;
            const teamIndexes = [];
            store.state.runDataActiveRun.teams.forEach(() => {
                teamIndexes.push(count);
                count++;
            });
            return teamIndexes;
        }
    }
</script>

<style scoped>
    #player-container {
        position: absolute;
        top: 500px;
        left: 90px;
    }
    #team-container {
        position: absolute;
        top: 500px;
        left: 90px;
    }
    .player {
        width: 500px;
        margin-bottom: 30px;
    }
    .team {
        width: 500px;
        margin-bottom: 30px;
    }
    .Interview {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 1920px;
        height: 1080px;
        background: linear-gradient(-128deg, var(--gradient-light) 0, var(--gradient-dark) 100%) 100% no-repeat fixed;
    }

    #discord-voice {
        position: absolute;
        top: -90px;
        left: 1220px;
        width: 700px;
        height: 1080px;
        /*background-color: var(--container-background-color);*/
    }
    #logo {
        position: absolute;
        left: 60px;
        top: 150px;
        width: 568px;
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
        top: 150px;
        left: 700px;
        width: 520px;
        height: 100px;
    }

    #timer {
        position: absolute;
        top: 325px;
        left: 710px;
        width: 500px;
        height: 150px;
    }
</style>
