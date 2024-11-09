<template>
    <div v-if="bid" id="Bid">
        <div class="Header">
            <span v-if="bid.goal"> Upcoming Goal </span>
            <span v-else> Upcoming Bid War </span>
        </div>
        <div class="incentive-container">
            <div class="RunName">{{ bid.game }}</div>
            <div class="BidName">
                {{ bid.bid }}
            </div>

            <div v-if="bid.goal != null" class="BidAmount">
                <div id="progressbar">
                    <div id="progress" :style="{ width: percentRaised(bid) + '%' }">
                        <div id="amount" :style="{ width: percentRaised(bid) + '%' }">
                            {{ formatUSD(bid.amount_raised) }}/{{ formatUSD(bid.goal) }}
                        </div>
                    </div>
                </div>
            </div>
            <div v-else-if="Object.keys(bid.options).length === 0" class="BidAmount">
                <div v-if="bid.options.length">
                    <!--
					<div
						v-for="option in bid.options"
						:key="`${option.name}${option.amount_raised}`"
					>
						{{ option.name }} ({{ formatUSD(option.amount_raised) }})
					</div>-->

                    <div v-if="bid.allow_custom_options">...or you could submit your own idea!</div>
                </div>
                <div v-else-if="bid.allow_custom_options">No options submitted yet, be the first!</div>
            </div>
            <div v-else class="BidAmount">
                <div class="bid-graphics" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import clone from 'clone';
    import { TrackerOpenBid } from '../../../../../types';
    import { Component, Vue } from 'vue-property-decorator';
    import { store } from '../../../../browser-util/state';
    import * as d3 from 'd3';
    import { formatAmount } from '../../../_misc/formatAmount';

    @Component({})
    export default class Bid extends Vue {
        bid: TrackerOpenBid = null;

        mounted() {
            const chosenBid = this.getRandomBid();
            if (!chosenBid) {
                this.$emit('end');
            } else {
                this.bid = clone(chosenBid);
            }
            this.bid = clone(chosenBid);
            if (this.bid.options && this.bid.options.length > 0) {
                this.$nextTick(() => {
                    this.makeBars(this.bid);
                });
            }
            setTimeout(() => this.$emit('end'), 20 * 1000);
        }

        formatUSD(amount) {
            return formatAmount(amount);
        }

        percentRaised(bid: TrackerOpenBid) {
            if (bid.amount_raised >= bid.goal) {
                return 100;
            }
            let percent = bid.goal / 100;
            return bid.amount_raised / percent;
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
                return openBids[Math.floor(Math.random() * openBids.length)];
            } else {
                return null;
            }
        }

        makeBars(bid: TrackerOpenBid) {
            const data = bid.options
                .map((option) => ({ name: option.name, value: option.amount_raised }))
                .sort(function (a, b) {
                    return d3.ascending(a.value, b.value);
                })
                .slice(0, 5);

            //set up svg using margin conventions - we'll need plenty of room on the left for labels
            var margin = {
                top: 0,
                right: 200,
                bottom: 15,
                left: 350
            };

            var color = d3.scaleOrdinal(['#3f84e5', '#faa300', '#f63e02', '#a41623', '#2f4858']);

            var width = 1100 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

            var svg = d3
                .select('.bid-graphics')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            var x = d3.scaleLinear([0, width]).domain([
                0,
                d3.max(data, function (d) {
                    return d.value;
                })
            ]);

            var y = d3
                .scaleBand()
                .range([height, 0])
                .padding(0.1)
                .domain(data.map((d) => d.name));

            svg.append('g').call(d3.axisLeft(y).tickSize(0).tickPadding(10));

            var bars = svg.selectAll('.bar').data(data).enter().append('g');

            //append rects
            bars.append('rect')
                .attr('class', 'bar')
                .attr('y', (d) => y(d.name))
                .style('fill', function (d, i) {
                    return color(`${i}`);
                })
                .attr('height', y.bandwidth())
                .attr('x', 0)
                .attr('width', (d) => x(d.value));

            //add a value label to the right of each bar
            bars.append('text')
                .attr('class', 'label')
                //y position of the label is halfway down the bar
                .attr('y', function (d) {
                    return y(d.name) + y.bandwidth() / 2 + 10;
                })
                //x position is 6 pixels to the right of the bar
                .attr('x', function (d) {
                    return x(d.value) + 6;
                })
                .text(function (d) {
                    return formatAmount(d.value);
                });
        }
    }
</script>

<style>
    #progressbar {
        position: absolute;
        top: 300px;
        left: 133px;
        width: 900px;
        background-color: rgba(0, 0, 0, 0);
        border: 2px var(--container-border-color) solid;
        height: 100px;
        align-content: end;
    }
    #amount {
        position: absolute;
        height: 100px;
        left: 0px;
        z-index: 6;
        top: 20px;
        align-content: center;
        align-self: center;
        align-items: center;
        justify-content: center;
        justify-items: center;
    }
    #progress {
        top: 0px;
        left: 0px;
        position: absolute;
        height: 100px;
        background-image: linear-gradient(#2f6faf, #235589);
        z-index: 5;
    }
    #goal {
        position: absolute;
        left: 1000px;
        top: 325px;
    }
    #Bid {
        position: absolute;
        display: flex;
        height: 100%;
        width: 100%;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        text-align: center;
    }
    #Bid > .Header {
        width: 100%;
        font-weight: 500;
        height: 60px;
        line-height: 60px;
        //background-color: var(--border-colour);
        color: white;
        font-size: 41px;
        text-transform: uppercase;
    }
    #Bid > .incentive-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        background-color: rgba(0, 0, 0, 0.3);
        overflow: hidden;
    }
    #Bid > .incentive-container > div {
        margin: 10px;
    }
    #Bid > .incentive-container > .RunName {
        font-size: 45px;
    }
    #Bid > .incentive-container > .BidName {
        font-size: 32px;
    }
    #Bid > .incentive-container > .BidAmount {
        height: 445px;
        font-size: 40px;
    }
    svg {
        font-size: 25px;
        color: white;
    }
    .arc text {
        text-anchor: middle;
    }

    g.tick,
    .label {
        font-size: 25px;
        fill: #fff;
    }

    path.domain {
        fill: none;
        display: none;
    }

    .bid-graphics {
        width: 1172px;
        height: 400px;
    }
</style>
