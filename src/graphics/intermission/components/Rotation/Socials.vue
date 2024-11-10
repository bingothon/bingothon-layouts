<template>
    <div id="Socials">
        <span id="SocialText">Follow Us</span>
        <table id="SocialsTable">
            <tr class="FlexContainer TwitterRow">
                <td>
                    <div id="TwitterLogo">
                        <img src="../../../../../static/twitter-logo-round.png" />
                    </div>
                </td>
                <td class="SociallNames">&#64;Bingothon</td>
            </tr>
            <tr class="FlexContainer TwitchRow">
                <td>
                    <div id="TwitchLogo">
                        <img src="../../../../../static/Twitch_icon.png" />
                    </div>
                </td>
                <td class="SociallNames">Bingothon</td>
            </tr>
            <tr class="FlexContainer YouTubeRow">
                <td>
                    <div id="YouTubeLogo">
                        <img src="../../../../../static/youtube-logo.png" />
                    </div>
                </td>
                <td class="SociallNames">c/Bingothon</td>
            </tr>
            <tr class="FlexContainer InstaRow">
                <td>
                    <div id="InstaLogo">
                        <img src="../../../../../static/Instagram_AppIcon_Aug2017.png" />
                    </div>
                </td>
                <td class="SociallNames">Bingothon_Marathon</td>
            </tr>
            <tr class="FlexContainer BskyRow">
                <td>
                    <div id="BskyLogo">
                        <img src="../../../../../static/Bluesky_Logo.svg.png" />
                    </div>
                </td>
                <td class="SociallNames">&#64;Bingothon.com</td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';

    @Component({})
    export default class Socials extends Vue {
        mounted() {
            setTimeout(() => this.$emit('end'), 20 * 1000);
        }
    }
</script>

<style scoped>
    #SocialText {
        position: absolute;
        align-content: center;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        top: 0px;
        left: 470px;
        font-size: 50px;
    }

    #SocialsTable {
        position: absolute;
        top: 80px;
    }

    #Socials {
        position: absolute;
        display: flex;
        height: 100%;
        width: 100%;
        flex-direction: column;
        justify-content: space-around;
    }

    #TwitterLogo > img {
        position: absolute;
        top: 0px;
        left: 250px;
        height: 85px;
    }

    #TwitchLogo > img {
        position: absolute;
        top: 120px;
        left: 250px;
        height: 85px;
    }

    #YouTubeLogo > img {
        position: absolute;
        top: 240px;
        left: 240px;
        height: 98px;
    }

    #InstaLogo > img {
        position: absolute;
        top: 360px;
        left: 250px;
        height: 85px;
    }

    #BskyLogo > img {
        position: absolute;
        top: 480px;
        left: 250px;
        height: 85px;
    }

    .SociallNames {
        margin-left: 300px;
        font-size: 50px;
        font-weight: bold;
        margin-bottom: 60px;
        align-content: flex-start;
    }
</style>
