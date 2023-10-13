<template>
    <div class="GameLayout">
        <!-- Game Cover Section -->
        <div class="GameCover">
            <img v-if="gameCoverUrl" :src="gameCoverUrl" />
        </div>

        <!-- Players Section -->
        <div class="PlayersContainer">
            <div v-for="(joystick, joystickIndex) in playerJoysticks" :key="joystickIndex">
                <div class="Chip FlexContainer">
                    <!-- <inline-svg class="joystick" v-if="joystick" :svg-content="joystick"> </inline-svg> -->
                    <span>{{ players[joystickIndex].name }}</span>
                </div>
            </div>
        </div>

        <!-- Game Title Section -->
        <div class="GameTitle">
            <div class="Title" v-if="gameTitle">
                {{ gameTitle }}
            </div>
        </div>

        <!-- Bingo Mode Section -->
        <div class="BingoMode">
            <div v-if="bingoLogo.length > 0">
                <div v-for="(logo, logoIndex) in bingoLogo" :key="logoIndex">
                    <img :src="logo" />
                </div>
                <div v-for="(mode, modeIndex) in bingoMode" :key="modeIndex">
                    <div class="ChipMode">
                        <span>{{ mode }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game Details Section -->
        <div class="GameDetails">
            <div v-for="(specialMode, specialModeIndex) in specialModes" :key="specialModeIndex">
                <div class="Chip">
                    <span>{{ specialMode }}</span>
                </div>
            </div>
            <div class="Estimate Chip" v-if="data.estimate">
                <span class="ChipText">{{ data.estimate }}</span>
            </div>
            <div class="GameSystem Chip" v-if="gameSystem">
                <img v-if="gameLogo" :src="gameLogo" /> <span class="ChipText">{{ gameSystem }} </span>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import moment from 'moment';
    import { RunData, RunDataPlayer } from 'speedcontrol-types';
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import InlineSvg from '../../components/InlineSvg.vue';

    @Component({
        components: { InlineSvg },
    })
    export default class RunUpcoming extends Vue {
        @Prop({ default: undefined })
        data: RunData;
        @Prop({ default: undefined })
        when: number;

        gameCoverUrl: string = '';

        mounted() {
            this.fetchGameCover();
        }

        async fetchGameCover() {
            const result = await this.searchGame(this.gameTitle);
            console.log(`Result in fetchGameCover: ${result}`);

            this.gameCoverUrl = result;
        }
        async searchGame(name: string) {
            try {
                const url = `http://localhost:3000/gamecover/${encodeURIComponent(name)}`;

                const headers = new Headers({
                    Accept: '*/*',
                    // Add only the headers that are absolutely necessary. Remove others.
                });

                const response = await fetch(url, {
                    method: 'GET',
                    headers: headers,
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();

                // Assuming that you still want to return the same field from the response:
                return result;
            } catch (error) {
                console.error('Error searching game:', error);
                throw error;
            }
        }

        get gameTitle(): string {
            return this.data.game;
        }

        get gameCategory(): string {
            return this.data.category;
        }

        get isTeamGame(): boolean {
            return this.data.teams.length > 1;
        }

        get gameSystem(): string {
            return this.data.system;
        }

        get isCoopGame(): boolean {
            const coopKeys = ['coop', 'co-op', 'co op'];
            if (coopKeys.some((key) => this.gameCategory.toLowerCase().includes(key))) {
                return true;
            }
        }

        get playerCount(): number {
            return this.data.teams[0].players.length;
        }

        get playerJoysticks(): string[] {
            let joysticks: string[] = [];

            let allPlayers = this.players;

            for (let i = 0; i < allPlayers.length; i++) {
                //let player = allPlayers[i];
                let joystickSVG = this.joyStick(`red`);
                joysticks.push(joystickSVG);
            }

            return joysticks;
        }

        get players(): RunDataPlayer[] {
            let allPlayers: RunDataPlayer[] = [];

            for (let team of this.data.teams) {
                for (let player of team.players) {
                    allPlayers.push(player);
                }
            }

            return allPlayers;
        }

        get bingoLogo(): string[] {
            const boardLogoMap: Record<string, string> = {
                blackout: require('../../../../static/assets/boards/logos/blackout.svg'),
                single: require('../../../../static/assets/boards/logos/single.svg'),
                double: require('../../../../static/assets/boards/logos/double.svg'),
                triple: require('../../../../static/assets/boards/logos/triple.svg'),
                quad: require('../../../../static/assets/boards/logos/quad.svg'),
                lockout: require('../../../../static/assets/boards/logos/lockout.svg'),
            };

            const matchedLogos: string[] = [];

            for (const key in boardLogoMap) {
                if (this.gameCategory.toLowerCase().includes(key.toLowerCase())) {
                    matchedLogos.push(boardLogoMap[key]);
                }
            }

            return matchedLogos;
        }

        get bingoMode(): string[] {
            const wordMap: Record<string, string> = {
                blackout: 'Blackout',
                single: 'Single',
                double: 'Double',
                triple: 'Triple',
                quad: 'Quad',
                lockout: 'Lockout',
                cinco: 'Cinco',
            };

            const matchedWords: string[] = [];

            for (const [key, value] of Object.entries(wordMap)) {
                if (this.gameCategory.toLowerCase().includes(key.toLowerCase())) {
                    matchedWords.push(value);
                }
            }

            return matchedWords;
        }

        get specialModes(): string[] {
            const wordMap: Record<string, string> = {
                randomizer: 'Randomizer',
                'co-op': 'Co-op',
                coop: 'Co-op',
                'co op': 'Co-op',
                chaos: 'Chaos',
                speech: 'Speech/Opening',
                '2v2': '2v2',
                blind: 'Blind',
                glitchless: 'Glitchless',
            };

            const matchedWords: string[] = [];

            for (const [key, value] of Object.entries(wordMap)) {
                if (this.gameCategory.toLowerCase().includes(key.toLowerCase())) {
                    matchedWords.push(value);
                }
            }

            if (matchedWords.length === 0) {
                matchedWords.push('Normal');
            }

            return matchedWords;
        }

        formPlayerNamesString(run) {
            const namesArray = [];
            let namesList = 'No Player(s)';
            run.teams.forEach((team) => {
                const teamPlayerArray = [];
                team.players.forEach((player) => teamPlayerArray.push(player.name));
                namesArray.push(teamPlayerArray.join(', '));
            });
            if (namesList.length) {
                namesList = namesArray.join(' vs. ');
            }
            return namesList;
        }

        checkForTotalPlayers(run) {
            let amount = 0;
            run.teams.forEach((team) =>
                team.players.forEach(() => {
                    amount += 1;
                }),
            );
            return amount;
        }

        formETAUntilRun() {
            const eta = moment.utc().second(0).to(moment.utc().second(this.when), true);
            return `In about ${eta}`;
        }

        joyStick(color: string): string {
            return `<?xml version="1.0" encoding="utf-8"?>
                    <svg height="800px" width="800px" version="1.1" id="Layer_1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path style="fill:#53CAF9;" d="M88.847,348.754c-14.958,0-27.082,12.124-27.082,27.084c0,0.455,0.011,0.908,0.033,1.358h54.101 c0.022-0.451,0.033-0.903,0.033-1.358C115.933,360.878,103.807,348.754,88.847,348.754z"/>
                    <polyline style="fill:#B4CCCB;" points="343.667,332.093 329.655,301.577 182.343,301.577 168.331,332.093 "/>
                    <path style="fill:#547475;" d="M158.272,422.301h259.293h63.798c12.457,0,22.554-10.097,22.554-22.554 c0-12.453-10.097-22.552-22.554-22.552h-63.798H94.435H30.638c-12.457,0-22.554,10.099-22.554,22.552 c0,12.457,10.097,22.554,22.554,22.554h63.798h39.402"/>
                    <circle style="fill:${color};" cx="256" cy="91.104" r="83.019"/>
                    <g style="opacity:0.2;">
                        <path style="fill:#231F20;" d="M198.474,91.106c0-41.516,30.473-75.913,70.273-82.046c-4.155-0.64-8.413-0.976-12.747-0.976 c-45.853,0-83.021,37.17-83.021,83.022s37.168,83.022,83.021,83.022c4.334,0,8.592-0.335,12.747-0.975 C228.947,167.019,198.474,132.622,198.474,91.106z"/>
                    </g>
                    <path style="fill:#DBDDDD;" d="M280.765,301.577V170.369c-7.821,2.441-16.139,3.759-24.765,3.759 c-8.625,0-16.943-1.318-24.765-3.759v131.208L280.765,301.577L280.765,301.577z"/>
                    <polyline style="fill:#8AACAD;" points="279.714,332.093 158.475,332.093 136.917,377.196 375.083,377.196 353.525,332.093 &#10;&#9;303.966,332.093 "/>
                    <g style="opacity:0.2;">
                        <path style="fill:#231F20;" d="M102.21,352.283c-3.943-2.242-8.502-3.529-13.364-3.529c-14.958,0-27.082,12.124-27.082,27.084 c0,0.455,0.011,0.908,0.033,1.358h26.726c-0.022-0.451-0.033-0.903-0.033-1.358C88.491,365.74,94.019,356.941,102.21,352.283z"/>
                    </g>
                    <g style="opacity:0.2;">
                        <polygon style="fill:#231F20;" points="182.343,301.577 168.331,332.093 195.059,332.093 209.072,301.577 &#9;"/>
                    </g>
                    <g style="opacity:0.2;">
                        <path style="fill:#231F20;" d="M256,174.127c-8.625,0-16.943-1.318-24.765-3.759v131.208h26.726V174.091 C257.31,174.106,256.656,174.127,256,174.127z"/>
                    </g>
                    <g style="opacity:0.2;">
                        <polygon style="fill:#231F20;" points="158.475,332.093 136.917,377.196 163.644,377.196 185.202,332.093 &#9;"/>
                    </g>
                    <g>
                        <path style="fill:#231F20;" d="M481.362,369.112H380.178l-19.36-40.505c-1.343-2.809-4.18-4.598-7.294-4.598h-4.674l-11.849-25.805 c-1.318-2.87-4.188-4.71-7.346-4.71h-40.806V176.06c34.045-13.211,58.257-46.298,58.257-84.954C347.105,40.871,306.235,0,256,0 s-91.105,40.871-91.105,91.106c0,38.657,24.212,71.745,58.257,84.954v117.432h-40.808c-3.159,0-6.029,1.84-7.346,4.71 l-11.849,25.805h-4.672c-3.114,0-5.951,1.788-7.294,4.598l-19.36,40.505h-8.458c-3.149-16.185-17.426-28.442-34.517-28.442 c-17.09,0-31.366,12.258-34.514,28.442H30.638C13.744,369.112,0,382.855,0,399.747c0,16.894,13.744,30.638,30.638,30.638h50.061 v14.236c0,15.162,12.335,27.497,27.499,27.497h239.783h53.535h15.795c6.247,0,11.331,5.082,11.331,11.329v20.469 c0,4.466,3.618,8.084,8.084,8.084s8.084-3.618,8.084-8.084v-20.469c0-15.162-12.335-27.497-27.499-27.497h-15.795h-53.535H108.198 c-6.247,0-11.331-5.082-11.331-11.329v-14.236h36.971c4.466,0,8.084-3.618,8.084-8.084s-3.618-8.084-8.084-8.084H96.867v-5.873 c0-4.466-3.618-8.084-8.084-8.084s-8.084,3.618-8.084,8.084v5.873H30.638c-7.979,0-14.47-6.49-14.47-14.47 c0-7.976,6.49-14.467,14.47-14.467h31.16h54.101h21.019h238.164h106.28c7.979,0,14.47,6.49,14.47,14.467 c0,7.979-6.49,14.47-14.47,14.47h-323.09c-4.466,0-8.084,3.618-8.084,8.084s3.618,8.084,8.084,8.084h323.09 c16.894,0,30.638-13.744,30.638-30.638C512,382.855,498.256,369.112,481.362,369.112z M181.064,91.106 c0-41.32,33.616-74.937,74.936-74.937s74.936,33.617,74.936,74.937c0,34.81-23.858,64.148-56.079,72.532 c-0.15,0.039-0.301,0.074-0.452,0.112c-0.909,0.231-1.826,0.439-2.749,0.636c-0.334,0.07-0.667,0.143-1.002,0.209 c-0.762,0.152-1.531,0.283-2.301,0.412c-0.82,0.135-1.643,0.255-2.467,0.364c-0.513,0.068-1.026,0.139-1.542,0.196 c-0.694,0.077-1.389,0.137-2.085,0.195c-0.358,0.03-0.716,0.057-1.076,0.082c-0.744,0.051-1.488,0.096-2.232,0.125 c-0.208,0.009-0.418,0.01-0.626,0.016c-1.55,0.047-3.102,0.047-4.653,0c-0.209-0.006-0.418-0.008-0.627-0.016 c-0.745-0.029-1.489-0.074-2.232-0.125c-0.359-0.025-0.718-0.053-1.076-0.082c-0.696-0.057-1.392-0.119-2.085-0.194 c-0.516-0.057-1.029-0.128-1.542-0.196c-0.825-0.108-1.647-0.229-2.468-0.364c-0.77-0.128-1.538-0.26-2.299-0.412 c-0.336-0.066-0.669-0.139-1.005-0.21c-0.921-0.196-1.838-0.405-2.746-0.635c-0.151-0.038-0.303-0.074-0.453-0.113 C204.921,155.253,181.064,125.915,181.064,91.106z M239.32,180.685c0.568,0.106,1.141,0.182,1.712,0.276 c0.566,0.094,1.131,0.191,1.701,0.274c0.848,0.124,1.7,0.225,2.552,0.326c0.635,0.074,1.269,0.156,1.908,0.218 c0.797,0.077,1.595,0.127,2.394,0.182c0.687,0.049,1.371,0.108,2.062,0.14c0.859,0.041,1.719,0.049,2.579,0.066 c0.592,0.012,1.178,0.045,1.773,0.045s1.181-0.033,1.773-0.045c0.86-0.016,1.72-0.025,2.579-0.066 c0.691-0.032,1.374-0.093,2.062-0.14c0.799-0.056,1.597-0.107,2.394-0.182c0.639-0.061,1.272-0.143,1.908-0.218 c0.853-0.1,1.704-0.202,2.552-0.326c0.569-0.083,1.134-0.18,1.7-0.274c0.57-0.094,1.144-0.17,1.712-0.276v112.807h-33.36V180.685 H239.32z M71.077,369.112c2.721-7.166,9.66-12.274,17.768-12.274c8.11,0,15.051,5.107,17.772,12.274H71.077z M149.742,369.112 l13.829-28.935h116.142c4.466,0,8.084-3.618,8.084-8.084c0-4.465-3.618-8.084-8.084-8.084h-98.775l6.588-14.347h43.71h49.528 h43.708l6.588,14.347h-27.094c-4.466,0-8.084,3.62-8.084,8.084c0,4.466,3.618,8.084,8.084,8.084h39.676 c0.011,0,0.02,0.002,0.03,0.002c0.014,0,0.027-0.002,0.041-0.002h4.715l13.829,28.935H149.742z"/>
                        <path style="fill:#231F20;" d="M274.448,51.739c15.108,7.124,24.869,22.513,24.869,39.205c0,8.682-2.557,17.056-7.393,24.213 c-2.499,3.699-1.526,8.726,2.173,11.225c1.387,0.938,2.962,1.387,4.519,1.387c2.595,0,5.143-1.247,6.707-3.559 c6.65-9.841,10.165-21.344,10.165-33.266c0-22.92-13.401-44.049-34.141-53.83c-4.039-1.905-8.857-0.176-10.76,3.864 C268.681,45.017,270.41,49.834,274.448,51.739z"/>
                    </g>
                </svg>`;
        }

        get gameLogo(): string | undefined {
            // Map the gameSystem to its corresponding logo
            const logoMap: Record<string, string> = {
                pc: require('../../../../static/assets/game-systems/logos/pc.svg'),
                nes: require('../../../../static/assets/game-systems/logos/nes.svg'),
                snes: require('../../../../static/assets/game-systems/logos/snes.svg'),
                ps1: require('../../../../static/assets/game-systems/logos/ps1.svg'),
                playstation: require('../../../../static/assets/game-systems/logos/ps1.svg'),
                psp: require('../../../../static/assets/game-systems/logos/psp.svg'),
                ps2: require('../../../../static/assets/game-systems/logos/ps2.svg'),
                ps3: require('../../../../static/assets/game-systems/logos/ps3.svg'),
                gcn: require('../../../../static/assets/game-systems/logos/gcn.svg'),
                switch: require('../../../../static/assets/game-systems/logos/switch.svg'),
                n64: require('../../../../static/assets/game-systems/logos/n64.svg'),
                ds: require('../../../../static/assets/game-systems/logos/ds.svg'),
                gb: require('../../../../static/assets/game-systems/logos/gbclassic.svg'),
                gbc: require('../../../../static/assets/game-systems/logos/gbcolor.svg'),
                gba: require('../../../../static/assets/game-systems/logos/gbadvance.svg'),
                ps4: require('../../../../static/assets/game-systems/logos/ps4.svg'),
                wiiu: require('../../../../static/assets/game-systems/logos/wiiu.svg'),
                wii: require('../../../../static/assets/game-systems/logos/wii.svg'),
                xboxclassic: require('../../../../static/assets/game-systems/logos/xboxclassic.svg'),
                xboxone: require('../../../../static/assets/game-systems/logos/xboxone.svg'),
                xbox360: require('../../../../static/assets/game-systems/logos/xbox360.svg'),
                atari2600: require('../../../../static/assets/game-systems/logos/atari2600.svg'),
                atari7800: require('../../../../static/assets/game-systems/logos/atari7800.svg'),
                pcengine: require('../../../../static/assets/game-systems/logos/pcengine.svg'),
                segamastersystem: require('../../../../static/assets/game-systems/logos/segamastersystem.svg'),
                segagamegear: require('../../../../static/assets/game-systems/logos/segagamegear.svg'),
                segamegadrive: require('../../../../static/assets/game-systems/logos/segamegadrive.svg'),
                segasaturn: require('../../../../static/assets/game-systems/logos/segasaturn.svg'),
                segadreamcast: require('../../../../static/assets/game-systems/logos/segadreamcast.svg'),
                zxspectrum: require('../../../../static/assets/game-systems/logos/zxspectrum.svg'),
            };
            console.log(logoMap[this.gameSystem.toLocaleLowerCase()] || undefined);
            return logoMap[this.gameSystem.toLocaleLowerCase()] || undefined; // default to empty string if logo not found
        }
    }
</script>

<style>
    .GameLayout {
        display: flex;
        background-color: rgba(0, 0, 0, 0.3);
    }

    .GameCover {
        display: flex;
        flex: 1;
        max-width: 220px;
        margin-left: 15px;
        justify-content: left; /* This centers its children horizontally */
        align-items: center; /* Optional: This would vertically center the image if the .GameCover has a height larger than the image */
        min-width: 220px;
        flex-grow: 0;
        flex-shrink: 0;
    }

    .GameCover img {
        width: 100px;
        height: auto;
    }

    .PlayersContainer {
        flex: 2;
        display: flex;
        flex-direction: column;
        /* start at left side of flex */
        align-items: flex-start;
        min-width: 200px;
        max-width: 200px;
        justify-content: center;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: 200px;
    }

    .joystick svg {
        width: 25px;
        height: 25px;
        margin-top: 5px;
    }

    .Player {
        /* Add styles for each player container here */
    }

    .GameTitle {
        flex: 3;
        display: flex;
        flex-direction: column;
        align-items: center;
        /* horizontal align also center */
        justify-content: center;
        min-width: 380px;
        max-width: 380px;
        padding: 40px;
        flex-grow: 0;
        flex-shrink: 0;
    }

    .Title {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
    }

    .GameDetails {
        flex: 4;
        display: flex;
        flex-direction: column;
        align-items: flex-start; /* This makes the content align to the left */
        justify-content: center;
        flex-grow: 0;
        flex-shrink: 0;
    }

    .BingoMode {
        flex: 5;
        display: flex;
        flex-direction: column;
        align-items: flex-start; /* This makes the content align to the left */
        justify-content: center;
        max-width: 100px;
        min-width: 100px;
        flex-grow: 0;
        flex-shrink: 0;
    }

    .GameSystem img {
        width: auto;
        height: 30px;
    }

    .BingoMode img {
        width: auto;
        height: 80px;
    }

    .Chip span {
        flex-grow: 1;
        text-align: center;
        font-size: 1.5rem;
    }

    .Chip {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: 1.5rem;
        font-weight: bold;
        padding: 3px 4px;
        background-color: rgba(220, 240, 255, 0.9); /* Light blueish, slightly transparent */
        border-radius: 2px;
        font-size: 14px;
        height: 22px;
        min-width: 150px;
        color: #333;
        margin-left: 2px;
        margin: 4px;
        border: 1px solid rgba(180, 230, 255, 0.7); /* Slightly blueish border for that 'frozen' feel */

        /* Ice-like gradient background using SVG */
        background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="iceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(240, 255, 255, 0.7); stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(200, 240, 255, 0.9); stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23iceGradient)" /></svg>');
        box-shadow: 0px 0px 5px 2px rgba(200, 240, 255, 0.3); /* Subtle glow to add depth */
    }

    .ChipCategory {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: 1.5rem;
        font-weight: bold;
        padding: 3px 4px;
        background-color: rgba(220, 240, 255, 0.9); /* Light blueish, slightly transparent */
        border-radius: 2px;
        font-size: 14px;
        height: auto;
        min-width: 120px;
        color: #333;
        margin-left: 2px;
        margin: 4px;
        border: 1px solid rgba(180, 230, 255, 0.7); /* Slightly blueish border for that 'frozen' feel */

        /* Ice-like gradient background using SVG */
        background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="iceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(240, 255, 255, 0.7); stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(200, 240, 255, 0.9); stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23iceGradient)" /></svg>');
        box-shadow: 0px 0px 5px 2px rgba(200, 240, 255, 0.3); /* Subtle glow to add depth */
    }

    .ChipMode {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: 1.5rem;
        font-weight: bold;
        padding: 3px 4px;
        background-color: rgba(220, 240, 255, 0.9);
        border-radius: 2px;
        font-size: 14px;
        height: auto;
        min-width: 70px;
        color: #333;
        margin-top: -4px;
        border: 1px solid rgba(180, 230, 255, 0.7);
        background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="iceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(240, 255, 255, 0.7); stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(200, 240, 255, 0.9); stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23iceGradient)" /></svg>');
        box-shadow: 0px 0px 5px 2px rgba(200, 240, 255, 0.3);
        max-width: 70px;
    }
</style>
