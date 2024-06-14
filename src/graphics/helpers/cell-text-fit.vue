<template>
    <div class="cellTextFixContainer">
        <div class="fittedContent" :style="{ transform, top, 'font-size': optimizedFontSize }" v-html="text" />
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

    // stub cause fonts isn't known
    declare namespace document {
        const fonts: any;
    }

    @Component({ name: 'cell-text-fit' })
    export default class CellTextFit extends Vue {
        @Prop({ required: true })
        text: string;
        @Prop({})
        fontSize!: string;
        optimizedFontSize: string = "30px";
        transform: string = 'scaleX(1) scaleY(1)';
        top: string = '0';

        mounted() {
            this.optimizedFontSize = this.fontSize;
            const font = window.getComputedStyle(this.$el.querySelector('.fittedContent')).font;
            if (font) {
                document.fonts.load(font).then(() => {
                    this.fit();
                    // fuck chrome
                    setTimeout(this.fit, 1000);
                });
            } else {
                this.fit();
            }
        }

        @Watch('text')
        fit() {
            this.optimizedFontSize = this.fontSize;
            this.transform = `scaleX(1) scaleY(1)`;
            this.top = '0';
            this._fit(0);
        }
        _fit(depth) {
            this.$nextTick(() => {
                // get width height of parent and text container to calc scaling
                const container = this.$el.getBoundingClientRect();
                const fittedContent = this.$el.querySelector('.fittedContent');
                const fittedContentRect = fittedContent.getBoundingClientRect();
                var scaleX = container.width / fittedContentRect.width;
                var scaleY = container.height / fittedContentRect.height;
                const fontSize = window.getComputedStyle(fittedContent).fontSize;
                // limit recursion
                if (depth < 10 && (scaleY < 0.8 || scaleX < 0.7)) {
                    const minScale = Math.min(scaleY, scaleX);
                    let multiplier = 0.9;
                    if (minScale < 0.4) {
                        multiplier = 0.6;
                    } else if (minScale < 0.5) {
                        multiplier = 0.7;
                    } else if (minScale < 0.6) {
                        multiplier = 0.8;
                    }
                    this.optimizedFontSize = `calc(${fontSize} * ${multiplier})`;
                    this._fit(depth + 1);
                    return;
                }
                // limit max scale to 1
                scaleX = Math.min(1, scaleX);
                scaleY = Math.min(1, scaleY);
                // center
                var toLeft = (container.width - fittedContentRect.width) / 2;
                this.transform = `translateY(-50%) translateX(${toLeft}px) scaleX(${scaleX}) scaleY(${scaleY})`;
                this.top = '50%';
            });
        }
    }
</script>

<style>
    .cellTextFixContainer {
        width: 100%;
        height: 100%;
        text-align: center;
    }
    .cellTextFixContainer > .fittedContent {
        position: absolute;
        left: 0;
    }
    span.underline {
        text-decoration: underline;
    }
</style>
