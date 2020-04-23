'use strict';
import * as RequestPromise from 'request-promise';
import equal = require('deep-equal');
import * as nodecgApiContext from './util/nodecg-api-context';
import {
  TrackerOpenBids, TrackerDonations, DonationTotal, TrackerPrizes,
} from '../../schemas';
import { TrackerDonation, TrackerOpenBid } from '../../types';

const nodecg = nodecgApiContext.get();

// const Pusher = require('pusher-js');
const log = new nodecg.Logger(`${nodecg.bundleName}:tiltify`);
const client = RequestPromise.defaults({});

interface Challenge {
	id: number,
	type:string,
	name:string,
	totalAmountRaised:number,
	amount:number,
	campaignId:number,
	active:boolean,
	endsAt:number,
	createdAt:number,
	updatedAt:number,
}

interface PollOption {
	id:number,
	pollId:number,
	name:string,
	type:string,
	totalAmountRaised:number,
	createdAt:number,
	updatedAt:number,
}

interface Poll {
	id:number,
	name:string,
	active:boolean,
	type:string,
	campaignId:number,
	createdAt:number,
	updatedAt:number,
	options:PollOption[],
}

interface Donation {
	id:number,
	amount:number,
	name:string,
	comment:string,
	completedAt:number,
	sustained:boolean,
	challengeId?: number,
	pollOptionId?: number,
}

var requestOptions: RequestPromise.RequestPromiseOptions = {
	headers: {
		'Authorization': ''
	},
	json: true,
};

// Replicants

const donationTotalReplicant = nodecg.Replicant <DonationTotal>('donationTotal');
const openBidsReplicant = nodecg.Replicant<TrackerOpenBids>('trackerOpenBids');
const donationsReplicant = nodecg.Replicant <TrackerDonations>('trackerDonations');
// reset prizes cause there aren't any
nodecg.Replicant<TrackerPrizes>('trackerPrizes').value = [];

// for testing
const enableTiltifyTestDonations = nodecg.bundleConfig.tiltify.enableFakeDonations;
// Static constants from the proprietary tiltify api
const tiltifyApiKey = "c0b88d914287a2f4ee32";
const tiltifyCluster = "mt1";

if (nodecg.bundleConfig && nodecg.bundleConfig.tiltify && nodecg.bundleConfig.tiltify.enable) {
	if (enableTiltifyTestDonations) {

		// testing, create fake donations and polls
		const testWords = ['Lorem', "Ipsum", "Dolar","Si","Achmet","Greetings","From","Germany"];
		function randSentence(minWords: number, maxWords: number) {
			var words = minWords + Math.floor((maxWords-minWords)*Math.random());
			var sentence = "";
			for (var i = 1;i<words;i++) {
				sentence += testWords[Math.floor(Math.random()*testWords.length)] + " ";
			}
			sentence += testWords[Math.floor(Math.random()*testWords.length)];
			return sentence;
		}
		log.info('Tiltify enable in test mode, only fake donations');
		var pollId = 0;
		var pollOptionId = 0;
		var challengeId = 0;
		var testDonations: Donation[] = [];
		var testPolls: Poll[] = [];
		var testChallenges: Challenge[] = [];
		var testCampaign = {"amountRaised":0};

		// create test challenges
		for(var i = 0;i<8;i++) {
			testChallenges.push({
				"id":challengeId,
				"type":"Challenge",
				"name":randSentence(5,7),
				"totalAmountRaised":0,
				"amount":500+Math.floor(Math.random()*500),
				"campaignId":12345,
				"active":Math.random()<0.5,
				"endsAt":Date.now()+3600000,// ends in an hour
				"createdAt":Date.now(),
				"updatedAt":Date.now()});
			challengeId++;
		}
		// create test polls
		for(var i = 0;i<8;i++) {
			var nextPoll: Poll = {
				"id":pollId,
				"name":randSentence(4,8),
				"active":true,
				"type":"Poll",
				"campaignId":12345,
				"createdAt":Date.now(),
				"updatedAt":Date.now(),
				"options":[]};
			// testoptions
			for(var j=0;j<3;j++) {
				nextPoll.options.push({
					"id":pollOptionId,
					"pollId":pollId,
					"name":randSentence(1,3),
					"type":"PollOption",
					"totalAmountRaised":0,
					"createdAt":Date.now(),
					"updatedAt":Date.now()});
				pollOptionId++;
			}
			testPolls.push(nextPoll);
			pollId++;
		}
		var did = 0;
		function sendFakeDonation() {
			if (testDonations.length >= 10) {
				testDonations.pop();
			}
			var donationAmount = Math.floor(Math.random()*200 + 1);
			var testDono: Donation = {"id":did,"amount":donationAmount,"name":randSentence(1,2),"comment":randSentence(3,7),
				"completedAt":Date.now(),"sustained":false};
			
			// this donation either goes to nothing, a challenge or a poll
			var benefitOpt = Math.random();
			if (benefitOpt<0.3) {
				// supports nothing
			} else if (benefitOpt<0.6) {
				// supports a challenge
				var selectedChallenge = testChallenges[Math.floor(Math.random()*testChallenges.length)];
				selectedChallenge.totalAmountRaised += testDono.amount;
				testDono.challengeId = selectedChallenge.id;
			} else {
				// supports a poll, grab poll fist...
				var selectedOptions = testPolls[Math.floor(Math.random()*testPolls.length)].options;
				var selectedOption = selectedOptions[Math.floor(Math.random()*selectedOptions.length)];
				selectedOption.totalAmountRaised += testDono.amount;
				testDono.pollOptionId = selectedOption.id;
			}
			testDonations.unshift(testDono);
			testCampaign.amountRaised += donationAmount;
			_processRawDonation(testDono);
			did++;
			// schedule timeout for the next fake donation, between 2 and 12 secs
			setTimeout(sendFakeDonation, Math.floor(Math.random() * 10000 + 2000));
		}
		nodecg.listenFor('refreshTiltify', doUpdate);
		sendFakeDonation();
	} else {
		if (!nodecg.bundleConfig.tiltify.token)
			log.warn('Tiltify support is enabled but no API access token is set.');
		if (!nodecg.bundleConfig.tiltify.campaign)
			log.warn('Tiltify support is enabled but no campaign ID is set.');
		
		if (nodecg.bundleConfig.tiltify.token && nodecg.bundleConfig.tiltify.campaign) {
			requestOptions.headers = {'Authorization': 'Bearer '+nodecg.bundleConfig.tiltify.token};
			
			log.info('Tiltify integration is enabled.');

			// Do the initial request, which also checks if the key is valid.
			client.get('https://tiltify.com/api/v3/campaigns/'+nodecg.bundleConfig.tiltify.campaign, requestOptions, (err, resp) => {
				if (err) {
					log.error('Could not get initial tiltify campaign: ',err);
				} else {
					if (resp.statusCode === 403) {
						log.warn('Your Tiltify API access token is not valid.');
						return;
					}

					if (resp.statusCode === 404) {
						log.warn('The Tiltify campaign with the specified ID cannot be found.');
						return;
					}
					
					_processRawCampain(resp.body.data);
				}
				//setUpPusher();
				doUpdate();
				nodecg.listenFor('refreshTiltify', doUpdate);
				setInterval(doUpdate, 30 * 1000);
			});
		}
	}
}

/*function setUpPusher() {
	var tiltifyPusher = new Pusher(tiltifyApiKey, {cluster: tiltifyCluster});
	var channel = tiltifyPusher.subscribe("campaign."+nodecg.bundleConfig.tiltify.campaign);
	channel.bind("donation", _processPusherDonation);
	channel.bind('campaign', _processPusherCampain);
}

function _processPusherDonation(data: any) {
	_processRawDonation(data.data);
}

function _processPusherCampain(data: any) {
	_processRawCampain(data.data);
}*/

/**
 * Datastructure: {"type":"donation","data":{"id":1234,"amount":1,"name":"donatorname","comment":"Greetings from germany!",
 * "completedAt":1541438000000,"pollOptionId":123,"sustained":false}}
 * 
 * Either pollOptionId, rewardId, challengeId or none of them are present, linking to the specified resource
 */
function _processRawDonation(donation: Donation) {
	log.info("predonations:"+JSON.stringify(donation));
	// only process completed donations
	if (donation && donation.completedAt) {
		log.info("donation: "+JSON.stringify(donation));
		nodecg.sendMessage('newDonation', donation);
		doUpdate();
	}
}

function doUpdate() {
	log.info('Updating tiltify stuff...');
	reqCampain();
	refreshBids();
	reqDonations();
}

function reqCampain() {
	if (enableTiltifyTestDonations) {
		_processRawCampain(testCampaign);
		return;
	}
	client.get('https://tiltify.com/api/v3/campaigns/'+nodecg.bundleConfig.tiltify.campaign, requestOptions)
		.then(val => {
			if (val.data) {
				_processRawCampain(val.data);
			}
		}).catch(err => {
			log.error('error requesting campaign: ',err);
		});
}

function _processRawCampain(data: any) {
	// log.info("campaign: "+JSON.stringify(data));
	// Update the donation total replicant if it has actually changed.
	if (data && data.amountRaised !== undefined && donationTotalReplicant.value != data.amountRaised) {
		donationTotalReplicant.value = data.amountRaised;
		log.info("Updating total to "+donationTotalReplicant.value);
	}
}

function reqDonations() {
	if (enableTiltifyTestDonations) {
		_processRawDonations(testDonations);
		return;
	}
	client.get('https://tiltify.com/api/v3/campaigns/'+nodecg.bundleConfig.tiltify.campaign+"/donations", requestOptions)
		.then(val => {
			if (val.data) {
				_processRawDonations(val.data);
			}
		}).catch(err => {
			log.error('error getting donations: ',err);
		});
}

function _processRawDonations(data: Donation[]) {
	log.info("donations: "+JSON.stringify(data));
	const transformedDonations = data.map((d: Donation):TrackerDonation => {
		return {
			amount: d.amount,
			comment: d.comment || '',
			donor: d.name,
			id: d.id,
		};
	});
	if (!equal(donationsReplicant.value, transformedDonations)) {
		donationsReplicant.value = transformedDonations;
	}
}

function refreshBids() {
	client.get('https://tiltify.com/api/v3/campaigns/'+nodecg.bundleConfig.tiltify.campaign+'/polls', requestOptions)
		.then(val => {
			const polls: TrackerOpenBids = val.data.map((p: Poll): TrackerOpenBid => {
				return {
					allow_custom_options: false,
					amount_raised: p.options.reduce((a,b)=>a+b.totalAmountRaised, 0),
					bid: p.name,
					game: "",
					goal: null,
					run_started: false,
					state: p.active ? 'OPENED' : 'CLOSED',
					options: p.options.map((po: PollOption) => {
						return {
							amount_raised: po.totalAmountRaised,
							name: po.name,
						}
					}),
				};
			});
			client.get('https://tiltify.com/api/v3/campaigns/'+nodecg.bundleConfig.tiltify.campaign+'/challenges', requestOptions)
				.then(rawChallenges => {
					const challenges: TrackerOpenBids = rawChallenges.data.map((c: Challenge): TrackerOpenBid => {
						return {
							allow_custom_options: false,
							amount_raised: c.totalAmountRaised,
							bid: c.name,
							game: "",
							goal: c.amount,
							run_started: false,
							state: c.active ? 'OPENED' : 'CLOSED',
							options: [],
						};
					});
					const openBids = polls.concat(challenges);
					if (!equal(openBids, openBidsReplicant.value)) {
						log.debug('new bids:'+JSON.stringify(openBids));
						openBidsReplicant.value = openBids;
					}
				}).catch(e => {
					log.error('Error refreshing challenges!',e);
				})
		}).catch(e => {
			log.error('Error refreshing polls!',e);
		})
	
}

/**
 * Datastructure: [{"id":123,"name":"Polldescription","active":false,"type":"Poll","campaignId":12345,"createdAt":1525099745000,
 * "updatedAt":1526663265000,"options":
 * [{"id":1234,"pollId":123,"name":"Option 1","type":"PollOption",
 * "totalAmountRaised":8,"createdAt":1525099745000,"updatedAt":1525099745000}]}]
 */


/**
 * 
 * [{"id":1234,"type":"Challenge","name":"PollName","totalAmountRaised":0,"amount":500,
 * "campaignId":12345,"active":false,"endsAt":1524369600000,"createdAt":1523551888000,"updatedAt":1523553738000}]
 */
