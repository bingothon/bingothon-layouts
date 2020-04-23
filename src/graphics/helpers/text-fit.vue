<template>
    <div id="TextContainer">
        <div id="FittedTextContent" :style="{transform, top, left}">{{text}}</div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";

// stub cause fonts isn't known
declare namespace document {
    const fonts: any;
}

@Component({name:"text-fit"})
export default class TextFit extends Vue {
    @Prop({required: true})
    text: string;
    @Prop({default: "left"})
    align: ("left" | "right" | "center");
    transform: string = "scaleX(1)";
    top: string = "0";
    left: string = "0";

    mounted() {
        const font = window.getComputedStyle(this.$el.querySelector('#FittedTextContent')).font;
        if (font) {
            document.fonts.load(font).then(() => {
                this.fit();
                // fuck you chrome
                setTimeout(this.fit, 1000);
            });
        }
        this.$watch('text', ()=> {
            this.fit();
        }, {immediate: true});
    }

    fit() {
        this.transform = `scaleX(1)`;
        this.top = "0";
        this.$nextTick(()=> {
            // get width height of parent and text container to calc scaling
            const container = this.$el;
            const fittedContent = container.querySelector('#FittedTextContent');
            var scaleX = container.scrollWidth / fittedContent.scrollWidth;
            // console.log(container);
            
            // limit max scale to 1
            scaleX = Math.min(1,scaleX);
            // center if overflow
            var toLeft = (container.scrollWidth - fittedContent.scrollWidth) / 2;
            if (scaleX == 1) {
                if (this.align == "left") {
                    toLeft = 0;
                } else if(this.align == "center") {
                    toLeft = toLeft;
                } else {
                    toLeft = toLeft*2;
                }
            }
            this.transform = `translateY(-50%) translateX(${toLeft}px) scaleX(${scaleX})`;
            this.top = "50%";
        });
    }
}
</script>

<style>
    #TextContainer {
        height: 100%;
        width: 100%;
        white-space: nowrap;
    }
    #FittedTextContent {
        position: absolute;
    }
</style>