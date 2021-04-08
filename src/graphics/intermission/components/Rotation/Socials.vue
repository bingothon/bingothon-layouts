<template>
    <div id="Socials">
        <span id="SocialText">Follow Us</span>
        <table id="SocialsTable">
            <tr class="FlexContainer TwitterRow">
                <td>
                    <div id="TwitterLogo">
                        <img src="../../../../../static/twitter-logo-round.png">
                    </div>
                </td>
                <td class="SociallNames">
                    &#64;Bingothon
                </td>
            </tr>
            <tr class="FlexContainer YouTubeRow">
                <td>
                    <div id="YouTubeLogo">
                        <img src="../../../../../static/youtube-logo.png">
                    </div>
                </td>
                <td class="SociallNames">
                    c/Bingothon
                </td>
            </tr>
            <tr class="FlexContainer YouTubeRow">
                <td>
                    <div id="TwitchLogo">
                        <img src="../../../../../static/Twitch_icon.png">
                    </div>
                </td>
                <td class="SociallNames">
                    Bingothon
                </td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">

import {Component, Vue} from "vue-property-decorator";

@Component({})
export default class Socials extends Vue {

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
    top: 100px;
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
    height: 100px;
}

#YouTubeLogo > img {
    position: absolute;
    top: 200px;
    left: 240px;
    height: 115px;
}

#TwitchLogo > img {
    position: absolute;
    top: 400px;
    left: 250px;
    height: 100px;
}

.SociallNames {
    margin-left: 150px;
    font-size: 70px;
    font-weight: bold;
    margin-bottom: 115px;
}
</style>
