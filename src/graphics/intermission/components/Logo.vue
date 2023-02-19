<template>
    <div class="Logo">
        <img src="logo-winter.png" />
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'

    @Component({})
    export default class Logo extends Vue {}
</script>

<style scoped>
    .Logo > img {
        width: 307px;
    }
</style>
