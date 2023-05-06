<template>
    <div class="InfoStorageBox FlexContainer">
        <slot />
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';

    @Component({})
    export default class InfoStorageBox extends Vue {}
</script>

<style scoped>
    .InfoStorageBox {
        position: absolute;
        box-sizing: border-box;
        justify-content: flex-start;
        flex-direction: column;
    }
</style>
