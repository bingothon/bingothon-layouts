<template>
    <div id="GenericMessage" :style="cssProps">
        {{ normalisedData.msg }}
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';

    @Component({})
    export default class GenericMessage extends Vue {
        @Prop()
        data: { msg: string; size: number; time: number };

        get cssProps() {
            return {
                '--font-size': `${this.normalisedData.size}px`
            };
        }

        get normalisedData() {
            return Object.assign(
                {
                    size: 33,
                    time: 25
                },
                this.data
            );
        }

        mounted() {
            setTimeout(() => this.$emit('end'), this.normalisedData.time * 1000);
        }
    }
</script>

<style>
    #GenericMessage {
        width: 100%;
        font-weight: 500;
        font-size: var(--font-size);
        text-align: center;
        align-self: center;
    }
</style>
