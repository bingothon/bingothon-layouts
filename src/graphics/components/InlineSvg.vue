<!-- InlineSvg.vue -->
<template>
    <div v-html="svgContent"></div>
</template>

<script lang="ts">
    export default {
        props: {
            svgContent: String
        }
    };
</script>
