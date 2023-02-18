<template>
    <div id="Alert" class="FlexContainer">
        <div class="Line1">
            {{ line1 }}
        </div>
        <div
            v-if="line2"
            ref="Line2"
            class="Line2"
            :style="{
                width: width > 0 ? `${width}px` : 'inherit',
            }"
        >
            {{ line2 }}
        </div>
    </div>
</template>

<script lang="ts">
    import { gsap } from 'gsap'
    import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
    import { Component, Prop, Vue } from 'vue-property-decorator'

    gsap.registerPlugin(ScrollToPlugin)

    @Component({})
    export default class Alert extends Vue {
        @Prop({ default: { line1Text: '', line2Text: '' } })
        data: { line1Text: string; line2Text: string }

        width: number = 0

        line1: string = ''

        line2: string = ''

        tweet: boolean = false

        mounted() {
            const fallback = setTimeout(() => this.$emit('end'), 5000)
            const originalWidth = this.$parent.$el.clientWidth - 34
            this.line1 = this.data.line1Text
            if (!this.data.line2Text) {
                setTimeout(() => this.$emit('end'), 10 * 1000)
            } else {
                this.line2 = this.data.line2Text
                Vue.nextTick().then(() => {
                    this.width = originalWidth
                    setTimeout(() => {
                        clearTimeout(fallback)
                        var Line2 = this.$refs.Line2 as Element
                        const amountToScroll = Line2.scrollWidth - originalWidth
                        const timeToScroll = (amountToScroll * 13) / 1000
                        const timeToShow = timeToScroll > 10 ? timeToScroll : 6
                        gsap.to(this.$refs.Line2, timeToShow, {
                            scrollTo: { x: 'max' },
                            ease: 'none',
                            onComplete: () => {
                                setTimeout(() => this.$emit('end'), 2 * 1000)
                            },
                        })
                    }, 2 * 1000)
                })
            }
        }
    }
</script>

<style>
    #Alert {
        padding: 0 17px;
        height: 100%;
        font-weight: 500;
        flex-direction: column;
        align-items: flex-start;
        background-color: #ffffff38;
    }
    #Alert > .Line1 {
        font-size: 25px;
    }
    #Alert > .Line2 {
        font-size: 23px;
        white-space: nowrap;
        overflow: hidden;
    }
    #Alert > .Line1 > .TwitterLogo,
    #Alert > .Line1 > .CrowdControlLogo {
        height: 1.2em;
        margin: 0 0.05em 0 0.1em;
        vertical-align: -0.25em;
    }
</style>
