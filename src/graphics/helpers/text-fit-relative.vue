<template>
    <div id="TextContainer">
        <div id="FittedTextContent" :style="{ transform, top, position }">{{ text }}</div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';

    // stub cause fonts isn't known
    declare namespace document {
        const fonts: any;
    }

    @Component({ name: 'text-fit-relative' })
    export default class TextFitRelative extends Vue {
        @Prop({ required: true })
        text: string;
        @Prop({ default: 'left' })
        align: 'left' | 'right' | 'center';
        transform: string = 'scaleX(1)';
        top: string = '0';
        @Prop({ default: 'absolute' })
        position: 'absolute' | 'relative';
        @Prop({ default: 0 })
        margin: number;

        mounted() {
            const font = window.getComputedStyle(this.$el.querySelector('#FittedTextContent')).font;
            if (font) {
                document.fonts.load(font).then(() => {
                    this.fit();
                    // fuck you chrome
                    setTimeout(this.fit, 1000);
                });
            }
            this.$watch(
                'text',
                () => {
                    this.fit();
                },
                { immediate: true }
            );
        }

        fit() {
            this.transform = 'none'; // Reset any transformations
            this.top = '0';
            this.$nextTick(() => {
                const fittedContent = this.$el.querySelector('#FittedTextContent');
                const fittedContentBounds = fittedContent.getBoundingClientRect(); // The child you want to fit
                const parentBounds = fittedContent.parentElement.parentElement.getBoundingClientRect(); // The parent of the child
                const parentBoundWidthIncludingMargins = parentBounds.width - this.margin;

                //console.log(`fitted width:${fittedContentBounds.width} parent width: ${parentBounds.width}`);

                // Calculate the scaling factor based on width of the parent
                let scaleX = parentBoundWidthIncludingMargins / fittedContentBounds.width;

                // Limit max scale to 1 to prevent enlarging
                scaleX = Math.min(1, scaleX);

                // Calculate the translation for alignment
                let toLeft = 0;
                if (scaleX < 1) {
                    switch (this.align) {
                        case 'left':
                            toLeft = 0;
                            break;
                        case 'center':
                            toLeft = (parentBoundWidthIncludingMargins - fittedContentBounds.width * scaleX) / 2;
                            break;
                        case 'right':
                            toLeft = parentBoundWidthIncludingMargins - fittedContentBounds.width * scaleX;
                            break;
                    }
                }
                //console.log(`scaleX:${scaleX} toLeft:${toLeft}`);
                this.transform = `translateY(-50%) translateX(${toLeft}px) scaleX(${scaleX})`;
                this.top = '50%';
            });
        }
    }
</script>

<style>
    #TextContainer {
        height: 100% !important;
        width: auto !important;
    }

    #FittedTextContent {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
    }
</style>
