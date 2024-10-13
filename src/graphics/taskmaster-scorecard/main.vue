<template>
    <div class="scorecard-bg">
      <div class="central">
          <div v-for="(player, index) in players" class="player">
              <div class="player-img-frame">
                  <img class="player-img" :src="player.discordProfileUrl"/>
                  <img class="frame" src="./taskmaster-frame-sq.png" />
              </div>
              <span class="player-name">{{ player.displayName }}</span>
              <div class="score">
                  <span class="score-number">
                      {{ player.score }}
                  </span>
              </div>
          </div>
      </div>
    </div>
  </template>

<script lang="ts">
import { store } from '@/browser-util/state';
import Vue from 'vue';
import Component from 'vue-class-component';


@Component({
    components: {
    }
})
export default class TaskmasterScorecard extends Vue {
    get players() {
        return store.state.scorePlayers;
    }
}
</script>

<style>
body {
    margin: 0;
    padding: 0;
}
.scorecard-bg {
    background-image: url("./taskmaster-background.jpg");
    width: 1920px;
    height: 1080px;
}

.central {
    display: flex;
}

.player {
    height: 200px;
    width: 200px;
    margin-left: 55px;
}

.score {
    height: 90px;
    width: 90px;
    background: center / contain no-repeat url("./taskmaster-seal.png");
    position: relative;
    left: 55px;
}

.score-number {
    width: 100%;
    text-align: center;
    display: block;
    top: 16px;
    position: relative;
    font-size: 44px;
    color: white;
}

.frame {
    position: absolute;
    height: 200px;
    width: 200px;
}

.player-img {
    position: absolute;
    height: 180px;
    width: 180px;
    margin-left: 10px;
    margin-top: 10px;
}

.player-img-frame {
    height: 200px;
}

</style>
