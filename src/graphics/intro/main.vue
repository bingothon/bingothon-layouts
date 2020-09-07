<template>
	<div id="Intro">
		<video autoplay muted loop id="bgvid">
			<source src="../../../static/epicindeed.mp4" type="video/mp4">
		</video>
		<div class="FlexContainer" id="soom">
			The next match will start soon
		</div>
		<div id="matchupC">
			<div id="matchup">{{runnersToString(match)}}</div>
		</div>
		<!--TODO Replace with actual countdown-->
		<div id="Countdown">
			15:00
		</div>
		<info-storage-box
			id="Music"
		>
			<music></music>
		</info-storage-box>
	</div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {RunData, RunDataPlayer} from "../../../speedcontrol-types";
import {store} from "../../browser-util/state";
import Music from "./components/Music.vue";

@Component({
	components: {
		Music
	},
})

export default class Intermission extends Vue{

	get match() : RunData {
		return store.state.runDataActiveRun;
	}

	runnersToString (run : RunData) : string {
		let res = '';
		let j = 0;
		run.teams.forEach(team => {
			if (team.name) {
				res = res + team.name + ': ';
			}
			let i = 0;
			team.players.forEach(player => {
				res += player.name;
				if (i === (team.players.length - 1)) {//if current player is last player of team
					if (j === (run.teams.length - 1)) {//and last team of the run
						//do nothing
					} else {
						res += ' vs. ';//if not last team then addd vs.
					}
				} else {
					res += ' & '; //if not last player of team add &
				}
				i++;
			})
			j++;
		})
		return res;
	}
};
</script>

<style>
 #Intro {
	 position: absolute;
	 top: 0px;
	 left: 0px;
	 height: 1080px;
	 width: 1920px;
 }

 video {
	 object-fit: cover;
	 width: 100vw;
	 height: 100vh;
	 position: fixed;
	 top: 0;
	 left: 0;
 }
 #soom{
	 position: absolute;
	 left: 0px;
	 width: 1920px;
	 align-content: center;
	 top: 200px;
	 font-size: 50px;
	 color: white;
	 text-shadow: 3px 3px 5px black;
 }
 #matchupC{
	 position: absolute;
	 left: 0px;
	 width: 1920px;
	 align-content: center;
	 top: 300px;
	 font-size: 50px;
	 color: white;
	 text-align: center;
	 text-shadow: 3px 3px 5px black;
 }
 #Countdown{
	 position: absolute;
	 left: 0px;
	 width: 1920px;
	 align-content: center;
	 top: 500px;
	 font-size: 100px;
	 color: white;
	 text-align: center;
	 text-shadow: 3px 3px 5px black;
 }
 #Music {
	 font-family: Delfino;
	 position: absolute;
	 justify-content: flex-start;
	 flex-direction: row;
	 background-color: rgba(0,0,0,0.3);
	 left: 1400px;
	 top: 940px;
	 width: 1920px;
	 height: 60px;
	 font-size: 30px;
 }

</style>
