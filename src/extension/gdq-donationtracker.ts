// Note: This uses a fork from the GDQ donation tracker (https://github.com/bingothon/bingothon-donation-tracker)
// that exposes some feeds, inspired by the PowerupWithPride fork (https://github.com/PowerUpWithPride/donation-tracker-toplevel)

/* eslint-disable no-inner-declarations */

import * as RequestPromise from 'request-promise'
import * as nodecgApiContext from './util/nodecg-api-context'
import { TrackerOpenBids, TrackerDonations, DonationTotal, TrackerPrizes } from '../../schemas'
import { Configschema } from '../../configschema'
import { TrackerDonation } from '../../types'

import equal = require('deep-equal')

const nodecg = nodecgApiContext.get()
const config = nodecg.bundleConfig as Configschema
const log = new nodecg.Logger(`${nodecg.bundleName}:donationtracker`)
const client = RequestPromise.defaults({})

if (config && config.donationtracker && config.donationtracker.enable) {
    const donationTotalReplicant = nodecg.Replicant<DonationTotal>('donationTotal')
    const openBidsReplicant = nodecg.Replicant<TrackerOpenBids>('trackerOpenBids')
    const donationsReplicant = nodecg.Replicant<TrackerDonations>('trackerDonations')
    const prizesReplicant = nodecg.Replicant<TrackerPrizes>('trackerPrizes')
    const feedUrl = config.donationtracker.url
    const { eventSlug } = config.donationtracker
    function doUpdate(): void {
        // current donation total
        client
            .get(`${feedUrl}/feed/current_donations/${eventSlug}`, { json: true })
            .then((data): void => {
                if (data.total !== donationTotalReplicant.value) {
                    donationTotalReplicant.value = data.total
                    log.info(`donation total updated to ${data.total}`)
                }
            })
            .catch((err): void => {
                log.error('error getting donation total: ', err)
            })

        // all bids that are open
        client
            .get(`${feedUrl}/feed/upcoming_bids/${eventSlug}`, { json: true })
            .then((data): void => {
                if (!equal(openBidsReplicant.value, data.results)) {
                    openBidsReplicant.value = data.results
                    log.info(`bids updated to ${JSON.stringify(data.results)}`)
                }
            })
            .catch((err): void => {
                log.error('error getting bids: ', err)
            })

        // last 20 donations (limited by the tracker)
        // TODO: send out event on new donation
        client
            .get(`${feedUrl}/feed/donations/${eventSlug}`, { json: true })
            .then((data): void => {
                if (!equal(donationsReplicant.value, data.results)) {
                    donationsReplicant.value = data.results
                    log.info(`donations updated to ${JSON.stringify(data.results)}`)
                }
            })
            .catch((err): void => {
                log.error('error getting donations: ', err)
            })
        // get prizes
        client
            .get(`${feedUrl}/feed/prizes/${eventSlug}`, { json: true })
            .then((data): void => {
                if (!equal(prizesReplicant.value, data.results)) {
                    prizesReplicant.value = data.results
                    log.info(`prizes updated to ${JSON.stringify(data.results)}`)
                }
            })
            .catch((err): void => {
                log.error('error getting prizes: ', err)
            })
        // prizesReplicant.value = [{endtime: 1570702210000, minDonation: 10, name: "Epic Tr1cks Mug", provider: "The Tr1cks", image: "https://www.bingothon.com/pictures/logo-winter.png"},
        // {endtime: undefined, minDonation: 200, name: "Something", provider: "Someone", image: "https://www.bingothon.com/pictures/logo.jpg"}];
    }
    if (!config.donationtracker.test) {
        doUpdate()
        setInterval(doUpdate, 30000)
    } else {
        log.info('Tracker test mode enabled, using fake data')
        const testWords = ['Lorem', 'Ipsum', 'Dolar', 'Si', 'Achmet', 'Greetings', 'From', 'Germany', 'Save', 'Kill', 'the', 'Animals']
        function randSentence(minWords: number, maxWords: number): string {
            const words = minWords + Math.floor((maxWords - minWords) * Math.random())
            let sentence = ''
            for (let i = 1; i < words; i += 1) {
                sentence += `${testWords[Math.floor(Math.random() * testWords.length)]} `
            }
            sentence += testWords[Math.floor(Math.random() * testWords.length)]
            return sentence
        }
        const currentBids: TrackerOpenBids = []
        const donations: TrackerDonations = []
        const prizes: TrackerPrizes = []
        let donationTotal = 0
        let donationId = 0
        // generate test bid wars and incentives
        //for (let i = 0; i < 10; i += 1) {
        /* if (Math.random() < 0.5) {
        // incentive
        currentBids.push({
          allow_custom_options: false,
          amount_raised: 0,
          bid: randSentence(1, 3),
          // should probably check schedule here
          game: randSentence(1, 2),
          goal: 100 + Math.floor(Math.random() * 50),
          options: [],
          run_started: false,
          state: 'OPENED',
        });
      } else if (Math.random() < 0.5) {
        // disallow custom options
        const options = [];
        const opCount = Math.floor(2 + Math.random() * 3);
        for (let j = 0; j < opCount; j += 1) {
          options.push({
            name: randSentence(1, 2),
            amount_raised: 0,
          });
        }
        currentBids.push({
          allow_custom_options: false,
          // this value is ignored anyway
          amount_raised: -1,
          bid: randSentence(1, 3),
          // should probably check schedule here
          game: randSentence(1, 2),
          goal: null,
          options,
          run_started: false,
          state: 'OPENED',
        });
      } else {
        // custom options
        currentBids.push({
          allow_custom_options: true,
          // this value is ignored anyway
          amount_raised: -1,
          bid: randSentence(1, 3),
          // should probably check schedule here
          game: randSentence(1, 2),
          goal: null,
          options: [],
          run_started: false,
          state: 'OPENED',
        });
      } */
        const option1 = { name: 'Kill the Animals', amount_raised: 25 }
        const option2 = { name: 'Save the Animals', amount_raised: 5 }
        const option3 = { name: 'Sacrifice the Animals', amount_raised: 20 }
        const option4 = { name: 'Punish the Animals', amount_raised: 15 }
        const option5 = { name: 'Quarantine the Animals', amount_raised: 10 }
        const options = []
        options.push(option1, option2, option3, option4, option5)
        currentBids.push({
            goal: null,
            allow_custom_options: false,
            amount_raised: -1,
            bid: randSentence(3, 5),
            game: randSentence(4, 6),
            options,
            run_started: false,
            state: 'OPENED',
        })
        //}

        // generate fake prizes
        for (let i = 0; i < 5; i += 1) {
            prizes.push({
                endtime: null,
                minDonation: Math.floor(5 + Math.random() * 50),
                name: randSentence(1, 3),
                provider: randSentence(1, 2),
                starttime: null,
            })
        }

        // sending a fake donation
        function sendFakeDonation(): void {
            const dono: TrackerDonation = {
                // TODO: allow cents
                amount: Math.floor(1 + Math.random() * 10),
                comment: randSentence(0, 6),
                donor: randSentence(1, 3),
                id: donationId,
            }
            donationId += 1
            donationTotal += dono.amount
            donations.unshift(dono)
            // chance that it doesn't benefit any bid
            if (Math.random() < 0.5) {
                // choose bid to add this to, in theory this could be split up
                // but thats probably not needed
                const selected = currentBids[Math.floor(Math.random() * currentBids.length)]
                if (selected.goal != null) {
                    // incentive
                    selected.amount_raised = Math.min(selected.goal, selected.amount_raised + dono.amount)
                } else if ((selected.allow_custom_options && Math.random() < 0.2) || selected.options.length === 0) {
                    // new option
                    selected.options.push({
                        name: randSentence(1, 2),
                        amount_raised: dono.amount,
                    })
                } else {
                    // existing option
                    const option = selected.options[Math.floor(Math.random() * selected.options.length)]
                    option.amount_raised += dono.amount
                }
            }
        }

        // once called calls itself after a random timeout
        function periodicallySendFakeDonation(): void {
            sendFakeDonation()
            setTimeout(periodicallySendFakeDonation, 2000 + Math.floor(Math.random() * 20000))
        }

        function updateReplicantsWithFakeData(): void {
            donationTotalReplicant.value = donationTotal
            donationsReplicant.value = donations
            openBidsReplicant.value = currentBids
            prizesReplicant.value = prizes
        }

        // start with a few donations
        for (let i = 0; i < 5; i += 1) {
            sendFakeDonation()
        }

        // the update happends periodically, not if something happens
        setInterval(updateReplicantsWithFakeData, 30000)
        updateReplicantsWithFakeData()

        periodicallySendFakeDonation()
    }
} else {
    log.warn('not enabled!')
}
