<template>
    <div
        id="DynamicMessage"
        :style="cssProps"
    >
        {{ normalisedData.msg }}
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class DynamicMessage extends Vue{
    @Prop()
    data: {msg: string, size: number, time: number};

    get cssProps() {
        return {
            '--font-size': `${this.normalisedData.size}px`,
        };
    }

    get normalisedData() {
        return Object.assign({
            size: 33,
            time: 25,
        }, this.data);
    }

    mounted() {
        setTimeout(() => this.$emit('end'), this.normalisedData.time * 1000);
    }
};
</script>

<style>
#DynamicMessage {
    width: 100%;
    font-weight: 500;
    font-size: var(--font-size);
    text-align: center;
    align-self: center;
}
</style>
