<template>
    <div class="Divider" />
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'

    @Component({})
    export default class Divider extends Vue {}
</script>

<style scoped>
    .Divider {
        height: 100%;
        width: 3px;
        min-width: 3px;
        background-color: white;
    }
</style>
