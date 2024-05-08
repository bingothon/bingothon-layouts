<template>
    <div v-if="bid" id="Bid" class="FlexContainer">
        <div class="Line1">
            <span v-if="bid.goal"> Upcoming Goal: </span>
            <span v-else> Upcoming Bid War: </span>
            {{ bid.game }}
        </div>
        <div
            ref="Line2"
            class="Line2"
            :style="{
                width: width > 0 ? `${width}px` : 'inherit'
            }"
        >
            {{ bid.bid }} :
            <span v-if="bid.goal">
                {{ formatUSD(bid.amount_raised) }}/{{ formatUSD(bid.goal)
                }}{{ bid.amount_raised >= bid.goal ? ', Goal met!' : '' }}
            </span>
            <span v-else>
                <span v-if="bid.options.length" id="Options">
                    <span v-for="option in bid.options" :key="`${option.name}${option.amount_raised}`">
                        {{ option.name }} ({{ formatUSD(option.amount_raised) }})
                    </span>
                    <span v-if="bid.allow_custom_options"> ...or you could submit your own idea! </span>
                </span>
                <span v-else-if="bid.allow_custom_options"> No options submitted yet, be the first! </span>
            </span>
        </div>
    </div>
</template>

<script lang="ts">
    import clone from 'clone';
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { gsap } from 'gsap';
    import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
    import { store } from '../../../../browser-util/state';
    import { TrackerOpenBid } from '../../../../../types';

    gsap.registerPlugin(ScrollToPlugin);

    @Component({})
    export default class Bid extends Vue {
        @Prop({ default: null })
        data: Object;

        bid: TrackerOpenBid = null;

        width: number = 1;

        created() {
            const chosenBid = this.getRandomBid();
            if (!chosenBid) {
                this.$emit('end');
            } else {
                this.bid = clone(chosenBid);
            }
        }

        mounted() {
            const fallback = setTimeout(() => this.$emit('end'), 5000);
            const originalWidth = this.$parent.$el.clientWidth - 34;
            if (!this.bid) {
                return;
            }
            Vue.nextTick().then(() => {
                this.width = originalWidth;
                setTimeout(() => {
                    clearTimeout(fallback);
                    var Line2 = this.$refs.Line2 as Element;
                    console.log(this.bid);
                    const amountToScroll = Line2.scrollWidth - originalWidth;
                    const timeToScroll = (amountToScroll * 13) / 1000;
                    const timeToShow = timeToScroll > 25 ? timeToScroll : 21;
                    gsap.to(this.$refs.Line2, timeToShow, {
                        scrollTo: { x: 'max' },
                        ease: 'none',
                        onComplete: () => {
                            setTimeout(() => this.$emit('end'), 2 * 1000);
                        }
                    });
                }, 2 * 1000);
            });
        }

        formatUSD(amount) {
            return `$${amount.toFixed(2)}`;
        }

        getRandomBid(): TrackerOpenBid {
            let openBids = store.state.trackerOpenBids.filter((bid) => {
                // goal is null for bid wars
                if (bid.goal == null) {
                    // bid wars are closed manually
                    return bid.state == 'OPENED';
                } else {
                    // Incentives close as soon as the needed amount is reached
                    // we still want to display them until the run starts
                    return !bid.run_started;
                }
            });
            if (openBids.length) {
                // concentrate on the next bids
                openBids = openBids.splice(0, 5);
                return openBids[Math.floor(Math.random() * openBids.length)];
            } else {
                return null;
            }
        }
    }
</script>

<style scoped>
    #Bid {
        padding: 0 17px;
        height: 100%;
        font-weight: 500;
        flex-direction: column;
        align-items: flex-start;
    }
    .Line1 {
        font-size: 25px;
    }
    .Line2 {
        font-size: 23px;
        white-space: nowrap;
        overflow: hidden;
    }
    #Options > span:not(:last-of-type)::after {
        content: '/';
    }
</style>
