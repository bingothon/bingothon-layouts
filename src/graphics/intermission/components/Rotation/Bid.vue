<template>
	<div
		v-if="bid"
		id="Bid"
	>
		<div class="Header">
      <span v-if="bid.goal">
        Upcoming Goal
      </span>
	  <span v-else>
        Upcoming Bid War
      </span>
		</div>
		<div class="Body">
			<div class="BidName">
				{{ bid.bid }}
			</div>
			<div
				v-if="bid.goal!=null"
				class="BidAmount"
			>
				{{ formatUSD(bid.amount_raised) }}/{{ formatUSD(bid.goal) }}
			</div>
			<div
				v-else
				class="BidAmount"
			>
				<div v-if="bid.options.length">
					<div
						v-for="option in bid.options"
						:key="`${option.name}${option.amount_raised}`"
					>
						{{ option.name }} ({{ formatUSD(option.amount_raised) }})
					</div>
					<div v-if="bid.allow_custom_options">
						...or you could submit your own idea!
					</div>
				</div>
				<div v-else-if="bid.allow_custom_options">
					No options submitted yet, be the first!
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
    import clone from 'clone';
    import { TrackerOpenBid } from "../../../../../types";
    import { Component, Vue } from 'vue-property-decorator';
    import {store} from "../../../../browser-util/state";

    @Component({})
    export default class Bid extends Vue {

        bid : TrackerOpenBid = null;

        mounted() {
            const chosenBid = this.getRandomBid();
            if (!chosenBid) {
                this.$emit('end');
            } else {
                this.bid = clone(chosenBid);
            }

            this.bid = clone(chosenBid);
            setTimeout(() => this.$emit('end'), 20 * 1000);
        }

        formatUSD(amount) {
			return `$${amount.toFixed(2)}`;
		}

        getRandomBid(): TrackerOpenBid {
            let openBids = store.state.trackerOpenBids.filter(bid => {
                // goal is null for bid wars
                if (bid.goal == null) {
                    // bid wars are closed manually
                    return bid.state == "OPENED";
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
	};
</script>

<style>
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
		background-color: var(--border-colour);
		color: white;
		font-size: 41px;
		text-transform: uppercase;
	}
	#Bid > .Body {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		flex: 1;
		background-color: rgba(0,0,0,0.3);
	}
	#Bid > .Body > div {
		margin: 10px;
	}
	#Bid > .Body > .RunName {
		font-size: 45px;
	}
	#Bid > .Body > .BidName {
		font-size: 32px;
	}
	#Bid > .Body > .BidAmount {
		font-size: 40px;
	}
</style>
