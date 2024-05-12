<template>
    <div id="HostDashboard">
        <div v-if="adTimer > 0" id="intermission-ad-warning">Currently playing ads for {{ adTimer }} more seconds</div>
        <div v-if="hostsSpeakingDuringIntermission" id="intermission-live-warning">
            You are currently live on stream
        </div>
        <button id="Go-Live-Button" :disabled="!hostsCanGoLive" @click="toggleHostsSpeakingDuringIntermission">
            {{ hostsSpeakingToggleButtonText }}
        </button>
        <div id="Go-Live">Go live on stream during intermission</div>
        <div v-if="hostsCanGoLive">Time since last intermission start: {{ timeSinceLastIntermission }}</div>

        <div id="columnsWrapper">
            <div id="column1" class="column">
                <div id="PEFacts">
                    <div class="fact">
                        {{ charityTexts[charityIndex] }}
                    </div>
                    <button v-on:click="updateCharityIndex()">Update Text</button>
                </div>
                <div id="bidsHeader">Upcoming Goals/Bidwars:</div>
                <div id="bidsContainer">
                    <div v-for="(bid, i) in openBids" :key="i" class="bid">
                        {{ bid.game }} - {{ bid.bid }}
                        <div v-if="bid.goal">
                            <div class="bidRaised">
                                {{ formatDollarAmount(bid.amount_raised) }} /
                                {{ formatDollarAmount(bid.goal) }}
                            </div>
                            <div class="bidLeft">
                                {{ formatDollarAmount(bid.goal - bid.amount_raised) }} left to go!
                            </div>
                        </div>
                        <div v-else>
                            <div v-if="bid.options.length">
                                <div v-for="(option, j) in bid.options" :key="i + ' ' + j" class="bidOption">
                                    {{ option.name }} - {{ formatDollarAmount(option.amount_raised) }}
                                </div>
                                <div v-if="bid.allow_custom_options" class="customOptions">
                                    Users can submit their own options
                                </div>
                            </div>
                            <div v-else class="NoOptions">No options submitted yet.</div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="column2" class="column">
                <div id="scheduleHeader">Run Schedule:</div>
                <div id="runsContainer">
                    <div id="currentRunInfo" class="run">
                        Running right now:
                        <div>
                            {{ currentRun.game }} - {{ currentRun.category }}
                            <div class="runners">
                                {{ runnersToString(currentRun) }}
                            </div>
                        </div>
                    </div>
                    <div v-if="comingUpRun" id="comingUpInfo" class="run">
                        Coming Up:
                        <div>
                            {{ comingUpRun.game }} - {{ comingUpRun.category }}
                            <div class="runners">
                                {{ runnersToString(comingUpRun) }}
                            </div>
                        </div>
                    </div>
                    <div v-if="afterThatRun" id="afterThatInfo" class="run">
                        And next:
                        <div>
                            {{ afterThatRun.game }} - {{ afterThatRun.category }}
                            <div class="runners">
                                {{ runnersToString(afterThatRun) }}
                            </div>
                        </div>
                    </div>
                </div>
                <div id="BingothonTexts">
                    <div class="fact">
                        {{ bingothonTexts[bingothonIndex] }}
                    </div>
                    <button v-on:click="updateBingothonIndex()">Update Text</button>
                </div>
                <div id="SponsorTexts">
                    <div class="fact">
                        {{ sponsorTexts[sponsorIndex] }}
                    </div>
                    <button v-on:click="updateSponsorIndex()">Update Text</button>
                </div>
            </div>
            <div id="column3" class="column">
                <div id="donationTotalHeader">Donation Total:</div>
                <div id="donationTotal">{{ donationTotal }}</div>
                <br />
                <div id="prizesHeader">Currently Available Prizes:</div>
                <div id="prizesContainer">
                    <div v-for="(prize, k) in prizes" :key="k" class="prize">
                        <div class="prizeName">
                            {{ prize.name }}
                        </div>
                        <div class="prizeInfo">Provided by {{ prize.provider }}</div>
                        <div class="prizeInfo">Minimum Donation: {{ formatDollarAmount(prize.minDonation) }}</div>
                        <div class="prizeInfo">
                            {{ getPrizeTimeUntilString(prize) }}
                        </div>
                    </div>
                </div>
            </div>
            <div id="column4" class="column">
                <div id="HostingBingo">
                    <HostBingo dashboard="true" fontSize="25px"></HostBingo>
                </div>
                <br />
                <br />
                <br />
                <div>
                    <h3>Show an image on stream</h3>
                    Paste the entire image Url here:
                    <input v-model="pictureDuringIntermissionUrl" />
                    <button @click="clearPicture">Clear picture</button>
                </div>
                <div>
                    <h3>Play a Twitch clip during intermission</h3>
                    Paste the full clips.twitch.tv url here:
                    <input v-model="twitchClipUrl" />
                    <button @click="startTwitchClip">Play</button>
                    <button @click="stopTwitchClip">Stop</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    const BLURBS: {
        bingothon: string[];
        charity: string[];
        sponsor: string[];
    } = require('../../../static/hostBlurbs.json');

    const BINGOTHON_BLURBS = BLURBS.bingothon;
    const CHARITY_BLURBS = BLURBS.charity;
    const SPONSOR_BLURBS = BLURBS.sponsor;

    import { Component, Vue } from 'vue-property-decorator';
    import { getReplicant, store } from '../../browser-util/state';
    import { TrackerPrize, TrackerOpenBid } from '../../../types';
    import moment from 'moment';
    import { RunData } from '../../../speedcontrol-types';
    import HostBingo from '../components/hostBingo.vue';
    import { HostsSpeakingDuringIntermission, ShowPictureDuringIntermission } from '@/schemas';

    @Component({
        components: {
            HostBingo
        }
    })
    export default class HostDashboard extends Vue {
        timeSinceLastIntermission: string = '';
        lastIntermissionInterval: NodeJS.Timeout | null = null;
        charityIndex: number = 0;
        bingothonIndex: number = 0;
        sponsorIndex: number = 0;
        twitchClipUrl: string = '';

        get adTimer(): number {
            return store.state.twitchCommercialTimer.secondsRemaining;
        }

        get donationTotal() {
            return this.formatDollarAmount(store.state.donationTotal);
        }

        get prizes(): TrackerPrize[] {
            return store.state.trackerPrizes; //probably needs to be formatted
        }

        get openBids(): TrackerOpenBid[] {
            return store.state.trackerOpenBids.filter((b) => b.state === 'OPENED');
        }

        get currentRun() {
            return store.state.runDataActiveRun;
        }

        get comingUpRun(): RunData {
            return this.getNextRuns(this.currentRun, 1);
        }

        get afterThatRun(): RunData {
            return this.getNextRuns(this.currentRun, 2);
        }

        get hostsSpeakingDuringIntermission(): boolean {
            return store.state.hostsSpeakingDuringIntermission.speaking;
        }

        // only during intermission
        get hostsCanGoLive(): boolean {
            return store.state.obsCurrentScene == 'intermission' && this.adTimer <= 0;
        }

        get hostsSpeakingToggleButtonText(): string {
            if (!this.hostsCanGoLive) {
                if (this.hostsSpeakingDuringIntermission) {
                    this.toggleHostsSpeakingDuringIntermission();
                }
                return '(Disabled)';
            } else if (this.hostsSpeakingDuringIntermission) {
                return 'Mute';
            } else {
                return 'Unmute on stream';
            }
        }

        get charityTexts(): String[] {
            return CHARITY_BLURBS; //.split('\n');
        }

        get bingothonTexts(): String[] {
            return BINGOTHON_BLURBS; //.split('\n');
        }

        get sponsorTexts(): String[] {
            return SPONSOR_BLURBS; //.split('\n');
        }

        get pictureDuringIntermissionUrl(): string {
            return store.state.showPictureDuringIntermission.imageUrl;
        }

        get twitchClipSlug(): string {
            const urlParts = this.twitchClipUrl.split('/');
            if (this.twitchClipUrl.includes('clips.twitch.tv')) {
                // For URLs like https://clips.twitch.tv/AwkwardScaryAniseKappaWealth
                return urlParts.pop(); // Gets the last segment after the last '/'
            } else if (this.twitchClipUrl.includes('twitch.tv') && urlParts.includes('clip')) {
                // For URLs like https://www.twitch.tv/esamarathon/clip/SparklingToughFriesRuleFive
                return urlParts[urlParts.indexOf('clip') + 1]; // Gets the segment after 'clip'
            }
            return ''; // Default return if the URL doesn't match expected formats
        }

        set pictureDuringIntermissionUrl(url: string) {
            getReplicant<ShowPictureDuringIntermission>('showPictureDuringIntermission').value.imageUrl = url;
        }

        mounted() {
            this.lastIntermissionInterval = setInterval(() => {
                const totalS = new Date().getTime() / 1000 - store.state.lastIntermissionTimestamp;
                const mins = (totalS / 60).toFixed(0);
                const secs = (totalS % 60).toFixed(0);
                this.timeSinceLastIntermission = mins + ':' + secs.padStart(2, '0');
            }, 1000);
        }

        destroyed() {
            if (this.lastIntermissionInterval) {
                clearInterval(this.lastIntermissionInterval);
                this.lastIntermissionInterval = null;
            }
        }

        toggleHostsSpeakingDuringIntermission() {
            getReplicant<HostsSpeakingDuringIntermission>('hostsSpeakingDuringIntermission').value.speaking =
                !store.state.hostsSpeakingDuringIntermission.speaking;
        }

        clearPicture() {
            this.pictureDuringIntermissionUrl = null;
        }

        runnersToString(run: RunData): string {
            let res = '';
            let j = 0;
            run.teams.forEach((team) => {
                if (team.name) {
                    res = res + team.name + ': ';
                }
                let i = 0;
                team.players.forEach((player) => {
                    res += player.name;
                    if (i === team.players.length - 1) {
                        //if current player is last player of team
                        if (j === run.teams.length - 1) {
                            //and last team of the run
                            //do nothing
                        } else {
                            res += ' vs. '; //if not last team then addd vs.
                        }
                    } else {
                        res += ' & '; //if not last player of team add &
                    }
                    i++;
                });
                j++;
            });
            return res;
        }

        // Formats dollar amounts to the correct string.
        formatDollarAmount(amount: number): string {
            // We drop the cents and add a comma over $1000.
            return '$' + amount.toFixed(2);
        }

        updateCharityIndex() {
            this.charityIndex = (this.charityIndex + 1) % this.charityTexts.length;
        }

        updateBingothonIndex() {
            this.bingothonIndex = (this.bingothonIndex + 1) % this.bingothonTexts.length;
        }

        updateSponsorIndex() {
            this.sponsorIndex = (this.sponsorIndex + 1) % this.sponsorTexts.length;
        }

        // Get the next Xth run in the schedule.
        getNextRuns(runData: RunData, X: number): RunData {
            let runDataArray = store.state.runDataArray;
            let indexOfCurrentRun = this.findIndexInRunDataArray(runData);
            let nextRuns = runDataArray[indexOfCurrentRun + X];
            return nextRuns;
        }

        // Find array index of current run based on it's ID.
        findIndexInRunDataArray(run: RunData): number {
            let indexOfRun = -1;
            let runDataArray = store.state.runDataArray;

            // Completely skips this if the run variable isn't defined.
            if (run) {
                for (let i = 0; i < runDataArray.length; i++) {
                    if (run.id === runDataArray[i].id) {
                        indexOfRun = i;
                        break;
                    }
                }
            }
            return indexOfRun;
        }

        // calculate the time until the prize period ends and render it as a human readable string ("an hour", "20 minutes")
        getPrizeTimeUntilString(prize: TrackerPrize) {
            if (prize.endtime) {
                let timeUntil = moment(prize.endtime).fromNow(true);
                timeUntil = timeUntil.replace('an ', ''); // Dirty fix for "Donate in the next an hour".
                timeUntil = timeUntil.replace('a ', ''); // Dirty fix for "Donate in the next a day".
                return `Donate in the next ${timeUntil}`;
            } else {
                return `Donate until the end of the event`;
            }
        }

        startTwitchClip() {
            nodecg.sendMessage('playTwitchClip', this.twitchClipSlug);
        }

        stopTwitchClip() {
            nodecg.sendMessage('stopTwitchClip');
        }
    }
</script>

<style>
    body {
        background-color: black;
    }

    #HostDashboard {
        color: white;
        background-color: black;
        height: 2000px;
        width: 1920px;
        position: absolute;
        left: 0px;
        top: 0px;
    }

    #columnsWrapper {
        height: inherit;
        width: inherit;
        display: flex;
    }

    .column {
        height: inherit;
        width: 25%;
        display: flex;
        align-items: center; /* Aligns horizontally centre. */
        flex-direction: column;
        padding: 0 10px;
    }

    #donationTotalHeader,
    #prizesHeader,
    #bidsHeader,
    #scheduleHeader,
    #unReadDonationsHeader,
    #videoHeader {
        font-size: 45px;
        text-align: center;
    }

    #donationTotal {
        font-size: 100px;
        padding-bottom: 30px;
    }

    #unReadDonationsContainer {
        font-size: 40px;
    }

    #unReadDonationsContainer li {
        padding-bottom: 20px;
    }

    #prizesContainer,
    #bidsContainer,
    #runsContainer,
    #PEFacts {
        width: 100%;
    }

    .prize:first-child,
    .bid:first-child,
    .run:first-child {
        margin-top: 10px;
        border-top: 5px solid white;
    }

    .fact {
        width: 100%;
        font-size: 30px;
        padding: 20px 0;
        text-align: center;
    }

    button {
        font-size: 15px;
        text-align: center;
        align-content: center;
    }

    .prize,
    .bid,
    .run {
        width: 100%;
        font-size: 30px;
        padding: 20px 0;
        text-align: center;
        border-bottom: 5px solid white;
    }

    .prizeName,
    .bidGame,
    .gameName {
        font-size: 45px;
    }

    .bidName:after {
        content: ':';
    }

    .gameTime:before {
        content: 'ESTIMATE: ';
    }

    .gameFinal:before {
        content: 'FINAL TIME: ';
    }

    #intermission-live-warning {
        width: 100%;
        height: 50px;
        background-color: red;
        text-align: center;
        font-size: 40px;
    }

    #intermission-ad-warning {
        width: 100%;
        height: 50px;
        background-color: darkred;
        text-align: center;
        font-size: 40px;
    }

    #HostingBingo {
        width: 100%;
    }

    #HostingBingo > .BingoBoard {
        width: 100%;
        padding-bottom: 100%;
        position: relative;
    }

    #Go-Live {
        font-size: 30px;
    }

    #Go-Live-Button {
        background-color: red;
        color: white;
    }
</style>
