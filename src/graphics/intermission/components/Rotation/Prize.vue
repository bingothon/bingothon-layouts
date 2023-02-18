<template>
    <div v-if="prize" id="Prize">
        <div class="Header">Prize Available</div>
        <div class="Body">
            <img v-if="prize.image" class="Image" :src="prize.image" />
            <div class="Title">{{ prize.name }} provided by {{ prize.provider }}</div>
            <div class="MinAmount">Minimum donation amount: {{ formatUSD(prize.minDonation) }}</div>
            <div class="Deadline">
                {{ getPrizeTimeUntilString(prize) }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import moment from 'moment'
    import clone from 'clone'
    import { TrackerPrize } from '../../../../../types'
    import { store } from '../../../../browser-util/state'
    import { Component, Prop, Vue } from 'vue-property-decorator'

    @Component({})
    export default class Prize extends Vue {
        @Prop({ default: undefined })
        data

        prize: TrackerPrize = null

        mounted() {
            const prizes = store.state.trackerPrizes.filter((prize) => {
                const now = moment()
                // filter out prizes that are already expired, no endtime means no expire
                if (
                    (!prize.endtime || moment(prize.endtime).isAfter(now)) &&
                    (!prize.starttime || moment(prize.starttime).isBefore(now))
                ) {
                    return true
                } else {
                    return false
                }
            })
            if (!prizes.length) {
                this.$emit('end')
            }
            const randNum = Math.floor(Math.random() * prizes.length)
            this.prize = clone(prizes[randNum])
            setTimeout(() => this.$emit('end'), 25 * 1000)
        }

        formatUSD(amount) {
            return `$${amount.toFixed(2)}`
        }

        getPrizeTimeUntilString(prize: TrackerPrize) {
            if (prize.endtime) {
                let timeUntil = moment(prize.endtime).fromNow(true)
                timeUntil = timeUntil.replace('an ', '') // Dirty fix for "Donate in the next an hour".
                timeUntil = timeUntil.replace('a ', '') // Dirty fix for "Donate in the next a day".
                return `Donate in the next ${timeUntil}`
            } else {
                return `Donate until the end of the event`
            }
        }
    }
</script>

<style>
    #Prize {
        position: absolute;
        display: flex;
        height: 100%;
        width: 100%;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        text-align: center;
    }
    #Prize > .Header {
        width: 100%;
        font-weight: 500;
        height: 60px;
        line-height: 60px;
        background-color: var(--border-colour);
        color: white;
        font-size: 41px;
        text-transform: uppercase;
    }
    #Prize > .Body {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        font-size: 41px;
        background-color: rgba(0, 0, 0, 0.3);
    }
    #Prize > .Body > .Image {
        height: 400px;
        object-fit: contain;
    }
    #Prize > .Body > .Title {
        font-size: 40px;
    }
    #Prize > .Body > .MinAmount {
        font-size: 30px;
    }
    #Prize > .Body > .Deadline {
        font-size: 30px;
    }
</style>
