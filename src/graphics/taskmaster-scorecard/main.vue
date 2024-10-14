<template>
    <div class="scorecard-bg">
      <div class="central">
          <div :key="index" v-for="(player, index) in playersWithOffset" :style="{ left: `${player.xOffset}px`}" class="player">
              <div class="player-img-frame">
                  <img class="player-img" :src="player.discordProfileUrl"/>
                  <img class="frame" src="./taskmaster-frame-sq.png" />
              </div>
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

const xOffsets = new Array(5).fill(0).map((_, index) => index * 300 + (index + 1) * 70);

interface PlayerWithOffset {
    score: number,
    discordProfileUrl: string,
    xOffset: number,
}

@Component({
    components: {
    }
})
export default class TaskmasterScorecard extends Vue {
    get players() {
        return store.state.scorePlayers;
    }
    get playersWithOffset(): PlayerWithOffset[] {
        const scoreToIndex = this.players.map((player, index) => ({score: player.score, index})).sort((a, b) => a.score - b.score);
        return this.players.map((player, index) => ({
            score: player.score,
            discordProfileUrl: player.discordProfileUrl,
            xOffset: xOffsets[scoreToIndex.findIndex(sToI => sToI.index == index)],
        }))
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
    --frame-size: 300px;
}

.central {
    display: flex;
}

.player {
    height: var(--frame-size);
    width: var(--frame-size);
    position: absolute;
    top: 400px;
    transition: left 2s;
}

.score {
    height: calc(var(--frame-size) * 0.45 );
    width: calc(var(--frame-size) * 0.45 );
    background: center / contain no-repeat url("./taskmaster-seal.png");
    position: relative;
    left: calc(var(--frame-size) * 0.275 );
}

.score-number {
    width: 100%;
    text-align: center;
    display: block;
    top: 16px;
    position: relative;
    font-size: 44px;
    color: white;
    top: calc((100% - 1em) / 2);
}

.frame {
    position: absolute;
    height: var(--frame-size);
    width: var(--frame-size);
}

.player-img {
    position: absolute;
    height: calc(var(--frame-size) * 0.9 );
    width: calc(var(--frame-size) * 0.9 );
    margin-left: calc(var(--frame-size) * 0.05 );
    margin-top: calc(var(--frame-size) * 0.05 );
    background: rgba(255, 255, 255, 0.95);
}

.player-img-frame {
    height: var(--frame-size);
}

</style>
