<template>
    <div id="HostDashboard">
        <div id="intermission-ad-warning" v-if="adTimer > 0">Currently playing ads for {{ adTimer }} more seconds</div>
        <div id="intermission-live-warning" v-if="hostsSpeakingDuringIntermission">You are currently live on stream
        </div>
        <button
            @click="toggleHostsSpeakingDuringIntermission"
            :disabled="!hostsCanGoLive"
            id="Go-Live-Button"
        >
            {{ hostsSpeakingToggleButtonText }}
        </button>
        <div id="Go-Live">
            Go live on stream during intermission
        </div>
        <div v-if="hostsCanGoLive">
            Time since last intermission start: {{ timeSinceLastIntermission }}
        </div>

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
                    <div
                        class="bid"
                        v-for="(bid,i) in openBids"
                        :key="i"
                    >
                        {{ bid.game }} - {{ bid.bid }}
                        <div
                            v-if="bid.goal"
                        >
                            <div class="bidRaised">
                                {{ formatDollarAmount(bid.amount_raised, true) }} /
                                {{ formatDollarAmount(bid.goal, true) }}
                            </div>
                            <div class="bidLeft">
                                {{ formatDollarAmount(bid.goal - bid.amount_raised, true) }} left to go!
                            </div>
                        </div>
                        <div v-else>
                            <div v-if="bid.options.length">
                                <div
                                    class="bidOption"
                                    v-for="(option, j) in bid.options"
                                    :key="i + ' ' + j"
                                >
                                    {{ option.name }} - {{ formatDollarAmount(option.amount_raised, true) }}
                                </div>
                                <div v-if="bid.allow_custom_options" class="customOptions"> Users can submit their own
                                    options
                                </div>
                            </div>
                            <div v-else class="NoOptions"> No options submitted yet.</div>
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
                    <div id="comingUpInfo" class="run" v-if="comingUpRun">
                        Coming Up:
                        <div>
                            {{ comingUpRun.game }} - {{ comingUpRun.category }}
                            <div class="runners">
                                {{ runnersToString(comingUpRun) }}
                            </div>
                        </div>
                    </div>
                    <div id="afterThatInfo" class="run" v-if="afterThatRun">
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
                <div>
                    Paste the entire image Url here: <input v-model="pictureDuringIntermissionUrl">
                    <button @click="clearPicture">Clear picture</button>
                </div>
                <div id="donationTotalHeader">Donation Total:</div>
                <div id="donationTotal">{{ donationTotal }}</div>
                <br>
                <div id="prizesHeader">Currently Available Prizes:</div>
                <div id="prizesContainer">
                    <div
                        class="prize"
                        v-for="(prize,k) in prizes"
                        :key="k"
                    >
                        <div class="prizeName">
                            {{ prize.name }}
                        </div>
                        <div class="prizeInfo">
                            Provided by {{ prize.provider }}
                        </div>
                        <div class="prizeInfo">
                            Minimum Donation: {{ formatDollarAmount(prize.minDonation, true) }}
                        </div>
                        <div class="prizeInfo">
                            {{ getPrizeTimeUntilString(prize) }}
                        </div>
                    </div>
                </div>
            </div>
            <div id="column4" class="column">
                <div id="HostingBingo">
                    <bingo-board class="BingoBoard" id="Bingo-board" bingoboardRep="hostingBingoboard"
                                 :alwaysShown="true" fontSize="25px"></bingo-board>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
const BINGOTHON_BLURBS = 'Did you know that Bingothon Winter 2021 is being streamed on both the SpeedRunsLive channel as well as our ' +
    'own Twitch channel? If you are enjoying this marathon, then do know that there is even more content on the Bingothon Twitch channel,' +
    ' including for example The Legend of Zelda: Breath of the Wild weekly bingo matches, and more!\n' +
    'Are you interested in featuring a bingo-related event on the Bingothon Twitch channel? Then do not hesitate to contact the Main Organizers' +
    ' on the Bingothon Discord server and we can certainly can discuss an arrangement to make it happen!\n' +
    'Bingothon has a Teepublic store where you can buy some cool merch, including the mugs you can win as a prize in this marathon! Revenue ' +
    'gained from the store would be used to further improve the marathon in many ways.\n' +
    'If you are watching on the Bingothon Twitch channel, why not subscribe? You can get access to some cool emotes, after all! Revenue made from ' +
    'subscribing does NOT go to the charity, but is used to improve Bingothon\'s marathons and other events, so your support is appreciated!\n' +
    'Do you wonder how people come up with bingo cards for their speedgames? What is the process behind it all? Well we do have the Beyond the ' +
    'Board monthly series that you can find on our YouTube channel, where we sit down with various bingo runners and interview them about their ' +
    'bingo cards, speedgame and much more that allows a great insight into how bingos are made and how the community can further support them! You can ' +
    'also find the FULL uncut interviews on our website at bingothon.com as well!\n' +
    'Bingothon is committed to supporting as many bingo events as possible, and for that to happen, restreamers are the unsung heroes we need to make ' +
    'that happen! If you are interested in volunteering as a restreamer, then do not hesitate to join our Discord server and talk to a Main Organizer ' +
    'about it!';

const CHARITY_BLURBS = 'Due to the ongoing situation in Ukraine, there is a widespread shortage in medicine and food, as well as other medical supplies for hospitals and other health facilities. As such, Project Hope responds by shipping essential supplies to affected areas as to help the people affected.\n' +
    'Project Hope has dispatched emergency teams within Ukraine as well as in Poland, Romania and in Moldova in order to provide as much help as possible both to those that are stuck in the country as well as refugees.\n' +
    'Project Hope dispatches kits to Ukraine known as IEHKs, or Interagency Emergency Health Kits, which can each support up to 10,000 people for three months. Each kit contains one ton of supplies, such as medical devices, medical supplies, topical medicines and oral medicines.\n' +
    'The Project Hope website, which you can find at projecthope.org, provides regular updates on their response to the current crisis, allowing a greater insight on what is happening on the ground.\n' +
    'Project HOPE began working in Ukraine in 2002 with a life-skills program focused on drug use prevention, HIV prevention, and education for children in primary schools. In 2007, Project HOPE began a five-year, USAID-funded HIV/AIDS Service Capacity project in Ukraine focused on community mobilization for the country’s most at-risk populations.\n' +
    'Project HOPE is working with the WHO Health Cluster and Logistics Cluster as well as the Ukrainian Ministry of Health and other authorities in order to keep expanding towards areas that are the most in need of immediate health and humanitarian relief\n' +
    'Beyond the critical help they provide for the current crisis in Ukraine, Project Hope has a history of responding to every major disaster since the 2004 Indonesian tsunami. Since then, HOPE has responded to disasters in Nepal, Haiti, Japan, China, the Philippines, and Indonesia, and they often stay behind to support communities as they recover with long-term support.\n';

const SPONSOR_BLURBS = 'Bingothon is sponsored by Team17, who currently have a huge Black Friday Sale on Steam across their vast library of indie titles, from 20% up to 90% off selected titles\n' +
    'Bingothon is sponsored by Team17 who recently launched their quirky, culinary adventure game Epic Chef across PC, Switch, Xbox and PS4\n' +
    'Bingothon is sponsored by Team17 who launched their colourful, dwarven mining simulator Hammerting on PC earlier this month\n' +
    'Bingothon is sponsored by Team17 who this week unleashed a new hero into their dark fantasy strategy game Age of Darkness currently in Steam Early' +
    ' Access\n' +
    'Bingothon is sponsored by Team17 who also provide a bunch of prizes for Bingothon Winter 2021. If you would like to learn more about them, type ' +
    '!prizes in the chat\n' +
    'We would like to thank Indiethon for providing prizes for Bingothon Winter 2021. Submissions for Indiethon are open until the 19th of December and' +
    ' will be live on their Twitch channel on the weekend of the 15th of January 2022. You may find more information about it on their Oengus page.'

import {Component, Vue} from "vue-property-decorator";
import {store, getReplicant} from "../../browser-util/state";
import {TrackerPrize} from "../../../types";
import moment from 'moment';
import fs from "fs";
import {RunData} from "../../../speedcontrol-types";
import BingoBoard from "../components/bingoboard.vue";
import {HostsSpeakingDuringIntermission, ShowPictureDuringIntermission} from "../../../schemas";

@Component({
    components: {
        BingoBoard
    }
})

export default class HostDashboard extends Vue {
    private charityIndex: number = 0;
    private bingothonIndex: number = 0;
    private sponsorIndex: number = 0;

    timeSinceLastIntermission: string = '';
    lastIntermissionInterval: NodeJS.Timeout | null = null;

    mounted() {
        this.lastIntermissionInterval = setInterval(() => {
            const totalS = ((new Date().getTime() / 1000) - store.state.lastIntermissionTimestamp);
            const mins = (totalS / 60).toFixed(0);
            const secs = (totalS % 60).toFixed(0);
            this.timeSinceLastIntermission = mins + ":" + secs.padStart(2, "0");
        }, 1000);
    }

    destroyed() {
        if (this.lastIntermissionInterval) {
            clearInterval(this.lastIntermissionInterval);
            this.lastIntermissionInterval = null;
        }
    }

    get adTimer(): number {
        return store.state.twitchCommercialTimer.secondsRemaining;
    }

    get donationTotal() {
        return this.formatDollarAmount(store.state.donationTotal, true);
    }

    get prizes() {
        return store.state.trackerPrizes;//probably needs to be formatted
    }

    get openBids() {
        return store.state.trackerOpenBids.filter(b => b.state === 'OPENED');
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
            return "(Disabled)";
        } else if (this.hostsSpeakingDuringIntermission) {
            return "Mute";
        } else {
            return "Unmute on stream";
        }
    }

    toggleHostsSpeakingDuringIntermission() {
        getReplicant<HostsSpeakingDuringIntermission>('hostsSpeakingDuringIntermission').value.speaking = !store.state.hostsSpeakingDuringIntermission.speaking;
    }

    clearPicture() {
        this.pictureDuringIntermissionUrl = null;
    }

    runnersToString(run: RunData): string {
        let res = '';
        let j = 0;
        run.teams.forEach(team => {
            if (team.name) {
                res = res + team.name + ': ';
            }
            let i = 0;
            team.players.forEach(player => {
                res += player.name;
                if (i === (team.players.length - 1)) {//if current player is last player of team
                    if (j === (run.teams.length - 1)) {//and last team of the run
                        //do nothing
                    } else {
                        res += ' vs. ';//if not last team then addd vs.
                    }
                } else {
                    res += ' & '; //if not last player of team add &
                }
                i++;
            })
            j++;
        })
        return res;
    }

    // Formats dollar amounts to the correct string.
    formatDollarAmount(amount: number, forceRemoveCents: boolean): string {
        // We drop the cents and add a comma over $1000.
        return '$' + amount.toFixed(2);
    }

    get charityTexts(): String[] {
        return CHARITY_BLURBS.split('\n');
    }

    get bingothonTexts(): String[] {
        return BINGOTHON_BLURBS.split('\n');
    }

    get sponsorTexts(): String[] {
        return SPONSOR_BLURBS.split('\n');
    }

    updateCharityIndex() {
        this.charityIndex = (this.charityIndex + 1) % (this.charityTexts.length);
    }

    updateBingothonIndex() {
        this.bingothonIndex = (this.bingothonIndex + 1) % (this.bingothonTexts.length);
    }

    updateSponsorIndex() {
        this.sponsorIndex = (this.sponsorIndex + 1) % (this.sponsorTexts.length);
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

    get pictureDuringIntermissionUrl(): string {
        return store.state.showPictureDuringIntermission.imageUrl;
    }

    set pictureDuringIntermissionUrl(url: string) {
        getReplicant<ShowPictureDuringIntermission>('showPictureDuringIntermission').value.imageUrl = url;
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

#donationTotalHeader, #prizesHeader, #bidsHeader, #scheduleHeader, #unReadDonationsHeader, #videoHeader {
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

#prizesContainer, #bidsContainer, #runsContainer, #PEFacts {
    width: 100%;
}

.prize:first-child, .bid:first-child, .run:first-child {
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

.prize, .bid, .run {
    width: 100%;
    font-size: 30px;
    padding: 20px 0;
    text-align: center;
    border-bottom: 5px solid white;
}

.prizeName, .bidGame, .gameName {
    font-size: 45px;
}

.bidName:after {
    content: ':';
}

.gameTime:before {
    content: 'ESTIMATE: '
}

.gameFinal:before {
    content: 'FINAL TIME: '
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
