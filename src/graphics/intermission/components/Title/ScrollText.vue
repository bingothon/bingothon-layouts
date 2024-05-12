<template>
    <div class="ScrollTextContainer">
        <div id="ScrollText" :class="{ scrollingText: isOverflowing, centeredText: !isOverflowing }" :style="cssProps">
            {{ data.msg }}
        </div>
        <!-- <div class="SnowContainer" v-if="isOverflowing">
            <svg
                id="SnowAnimation"
                :viewBox="'0 0 ' + svgWidth + ' ' + svgHeight"
                :width="svgWidth"
                :height="svgHeight"
            >
                <circle
                    v-for="(position, i) in snowSplashPositions"
                    :key="i"
                    class="SnowSplash"
                    r="3"
                    fill="white"
                    opacity="1"
                    :cx="position.cx"
                    :cy="position.cy"
                />
            </svg>
        </div> -->
    </div>
</template>

<script lang="ts">
    import { Prop, Vue, Watch, Component } from 'vue-property-decorator';
    import { gsap } from 'gsap';

    @Component
    export default class ScrollText extends Vue {
        @Prop({ default: { msg: '', size: 33, time: 25 } })
        data!: { msg: string; size: number; time: number };
        scrollPercentage: number = 0;
        isOverflowing: boolean = false;
        @Prop({ default: { x: -50, y: 0 } }) // default position, can be adjusted as needed
        // snowSplashPosition!: { x: number; y: number };
        // svgWidth: number = 50;
        // svgHeight: number = 50;
        margin: number = 75;
        animationDuration: number = 10;
        SPEED: number = 100;

        // get snowSplashPositions() {
        //     let positions = [];
        //     const halfWidth = this.svgWidth / 2;
        //     const minX = halfWidth;
        //     const maxX = this.svgWidth;
        //     const minY = 0;
        //     const maxY = halfWidth;

        //     for (let i = 0; i < 20; i++) {
        //         let randomX = Math.random() * (maxX - minX) + minX;
        //         let randomY = Math.random() * (maxY - minY) + minY;

        //         positions.push({
        //             cx: randomX,
        //             cy: randomY,
        //         });
        //     }
        //     return positions;
        // }

        get cssProps() {
            return {
                '--font-size': `${this.data.size}px`
            };
        }

        @Watch('data.msg')
        checkOverflow() {
            this.$nextTick(() => {
                const scrollTextElement = this.$el.querySelector('#ScrollText') as HTMLElement;

                // Directly reference the root element for the container
                const containerElement = this.$el as HTMLElement;

                //console.log('ScrollText width:', scrollTextElement.scrollWidth);
                //console.log('Container width:', containerElement.offsetWidth);

                this.isOverflowing = scrollTextElement.scrollWidth > containerElement.offsetWidth;

                //console.log('Element is overflowing:', this.isOverflowing);

                if (this.isOverflowing) {
                    this.scrollPercentage =
                        100 * (1 - containerElement.offsetWidth / (scrollTextElement.scrollWidth + this.margin));
                    this.animationDuration = scrollTextElement.scrollWidth / this.SPEED;
                }
            });
        }

        // animateSnowSplash() {
        //     // Slope (m) calculation for the entire SVG width and height
        //     const m = this.svgHeight / this.svgWidth;

        //     const tlSnowSplash = gsap.timeline({ repeat: -1, repeatDelay: 0 });

        //     tlSnowSplash.to('.SnowSplash', {
        //         x: (index, target) => {
        //             let baseX = +gsap.getProperty(target, 'x');
        //             let destinationX = baseX - Math.random() * 50;

        //             // Calculate slopeY based on the entire slope
        //             let slopeY = m * destinationX;
        //             gsap.set(target, { y: slopeY });

        //             return destinationX;
        //         },
        //         y: (index, target) => {
        //             let newY = +gsap.getProperty(target, 'y');
        //             return newY + Math.random() * 10 + 7; // Modify Y value to go slightly up or down
        //         },
        //         opacity: 1,
        //         stagger: 0.05,
        //         onComplete: function () {
        //             try {
        //                 gsap.set(this.target, { x: 0, y: 0, opacity: 1 });
        //             } catch (error) {
        //                 console.log(error);
        //             }
        //         },
        //     });
        // }

        animateTextScroll(element: HTMLElement) {
            const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 }); // infinite loop with a delay between repeats

            // Text Scroll animation
            tl.to(element, {
                x: `-=${this.scrollPercentage}%`,
                duration: this.animationDuration,
                ease: 'linear'
            })
                .to(element, {
                    opacity: 0,
                    duration: 0.5
                })
                .set(element, {
                    x: '0%'
                })
                .to(element, {
                    opacity: 1,
                    duration: 0.2,
                    onComplete: () => {
                        // This delay ensures that there's a gap before the text starts scrolling again.
                        gsap.delayedCall(0.5, () => {
                            tl.restart();
                        });
                    }
                });
        }

        mounted() {
            console.log('ScrollText component mounted');
            this.checkOverflow();

            setTimeout(() => {
                const scrollTextElement = this.$el.querySelector('#ScrollText') as HTMLElement;
                if (this.isOverflowing) {
                    this.animateTextScroll(scrollTextElement);
                    //this.animateSnowSplash();
                }
            }, 50); // wait vue hax

            setTimeout(() => this.$emit('end'), this.data.time * 1000);
        }
    }
</script>

<style>
    .ScrollTextContainer {
        position: relative;
        display: flex;
        height: 100%;
        width: 100%;
        align-items: flex-start;
        justify-content: flex-start;
        flex-direction: column;
        justify-content: space-around;
        overflow: visible; /* Allow overflow to be visible */
    }

    /* .ScrollTextContainer::after {
        content: '';
        position: absolute;
        right: -150px;
        top: 0;
        width: 200px;
        height: 200px;
        background: linear-gradient(
            to bottom left,
            #0a2146 50%,
            transparent 50%
        ); 
        z-index: 2;
    } */

    #ScrollText {
        font-weight: 500;
        font-size: var(--font-size);
        text-align: left;
        align-self: flex-start;
        white-space: nowrap;
        opacity: 1;
    }

    .centeredText {
        text-align: center;
        align-self: center !important;
    }

    /* .SnowContainer {
        position: absolute;
        width: 50px;
        height: 50px;
        overflow: visible;
        z-index: 5;
        right: -10px;
        top: 10px;
    } */
</style>
