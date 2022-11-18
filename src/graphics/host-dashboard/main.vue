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
                    <HostBingo fontSize="25px" dashboard="true"></HostBingo>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
const BINGOTHON_BLURBS = 'Did you know that Bingothon Summer 2022 is being streamed on both the SpeedRunsLive channel as well as our ' +
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

const CHARITY_BLURBS = 'Doctors Without Borders is an organization that offers medical humanitarian assistance to people based solely on need, irrespective of race, religion, gender or political affiliation. Their frontline workers including doctors, nurses and logisticians are often among the first on the scene when people\'s lives are upended by conflict, disease outbreak and other disasters.\n' +
    'Doctors Without Borders is active in many countries worldwide. They were involved in key support movements such as with COVID-19 emergency responses in various countries back in 2020, as well as key refugee work in Mexico, Central African Republic, Sudan and Syria.\n' +
    'Doctors Without Borders has been working in many countries with serious refugee crisis that have lasted many years, which to this day is still considered emergency work because the crisis has been ongoing for so long, and therefore need resources at all times to provide the best help they can.\n' +
    'As part of their medical work, Doctors Without Borders is involved in worldwide lifesaving responses including of course COVID-19, but also Cholera, Ebola, Hepatitis, HIV, Malaria, and more.\n' +
    'Funds raised during Bingothon Summer 2022 will be going towards Doctors Without Borders\' Emergency Relief Fund, which directly funds emergency relief operations worldwide. This includes operations in Ukraine and surrounding countries to assist people in the ongoing crisis, as well as other emergencies that may not be getting the same amount of attention or funding.\n' +
    'In eastern Ukraine, access to medical care is particularly difficult, so Doctors Without Borders teams are providing care through mobile clinics where they can.\n' +
    'Doctors Without Borders psychologists were deployed in Ukraine in order to support displaced people\'s mental health, and the organization is calling for more mental health support in the country as a whole.\n' +
    'Over the years, Doctors Without Borders have helped tremendous amounts of people in various ways. In 2020 alone, the organization has had almost 10 million outpatient consultations worldwide, more than 110,000 of those being for COVID-19. You can find more such statistics Doctors Without Borders\' website.\n' +
    'Doctors Without Borders still works hard to provide as much as they can in Syria, which remains one of the countries with one of the highest number of internally displaced people in the world, with a count of 6.7 million such people as of February 2022.';

const SPONSOR_BLURBS = 'Bingothon is sponsored by Team17, who recently announced their tactical diesel-punk looter shooter Marauders\n' +
    'Bingothon is sponsored by Team17 who recently announced the release date of 9th August for the visceral souls-borne Thymesia\n' +
    'Bingothon is sponsored by Team17 who recently announced the Dark Fantasy RTS Gord\n' +
    'Bingothon is sponsored by Team17 who recently announced their brand new Metroidvania, The Knight Witch, coming to Steam, PlayStation, Xbox and Switch later this year.\n' +
    'Bingothon is sponsored by Team17 who also provide a bunch of prizes for Bingothon Summer 2022. If you would like to learn more about them, type ' +
    '!prizes in the chat\n' +
    'Bingothon is sponsored by Team17 who recently announced that Sweet Transit, the unique rail-focused city-builder is coming out July 28th, with a limited-time demo now available on Steam!\n' +
    'Bingothon is sponsored by Team17 who recently launched the update for their 60\'s cult simulator - Honey, I Joined a Cult.\n' +
    'Bingothon is sponsored by Team17 who recently launched a new demo for their Roguelite action-RPG - The Unliving.\n' +
    'Bingothon is sponsored by Team17 who recently launched their botanical action-adventure game - The Serpent Rogue\n' +
    'Bingothon is sponsored by Team17 who recently announced the new first-person horror adventure game, coming to VR and Steam flat screen - Killer Frequency.\n' +
    'Bingothon is sponsored by Team17, who recently announced that Ship of Fools coming to console! This co-op crazed roguelike will have you on the edge of your seat reconsidering friendships! Wishlist now on Steam!\n' +
    'Bingothon is sponsored by Team17, who recently announced that Autopsy Simulator, the story-driven, horror-sim hybrid, will launch in November 2022.'


import {Component, Vue} from "vue-property-decorator";
import {store, getReplicant} from "../../browser-util/state";
import {TrackerPrize} from "../../../types";
import moment from 'moment';
import fs from "fs";
import {RunData} from "../../../speedcontrol-types";
import HostBingo from "../components/hostBingo.vue";
import {HostsSpeakingDuringIntermission, ShowPictureDuringIntermission} from "../../../schemas";

@Component({
    components: {
        HostBingo
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
