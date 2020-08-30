<template>
	<div>
    <bingo-board id="Bingo-board" fontSize="20px"></bingo-board>
    </div>
</template>

<script lang="ts">
	import { Component, Vue, Watch, Prop } from "vue-property-decorator";
	import { nodecg, NodeCG } from "../../browser-util/nodecg";
	import { Bingoboard, BingosyncSocket, BingoboardMeta } from "../../../schemas";
  import BingoBoard from "../components/bingoboard.vue";

	@Component({
		components: {
			BingoBoard,
		}
	})

	export default class GameLayout extends Vue {
	}
</script>

<style scoped>
  #Bingo-board {
    position: absolute;
    top: 0px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width:500px;
    height:500px;
  }
</style>
