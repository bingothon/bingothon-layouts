<template>
  <!-- eslint-disable vue/no-v-html -->
    <div
      class="EstimateBox FlexContainer"
    >
      {{estimate}}
    </div>
  <!-- eslint-enable -->
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { store } from '../../browser-util/state';

@Component({})
export default class EstimateContainer extends Vue {
    get estimate(): string {
        return store.state.runDataActiveRun.estimate
    }
}
</script>

<style scoped>

  .EstimateBox {
    font-size: 18px;
  }
</style>
