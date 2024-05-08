<template>
    <div v-show="isShown" class="twitch-clip-embed">
        <iframe :key="iframeKey" :src="twitchClipUrl" width="1172" height="660" frameborder="0" allowfullscreen="true">
        </iframe>
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator';
    // get the twitch accessToken from the nodecg bundle

    @Component
    export default class TwitchClipPlayer extends Vue {
        isShown: boolean = false; // This is the new data property for internal visibility control
        twitchClipSlug: string = '';
        durationInMilliseconds: number | null = null;
        iframeKey: number = 0;

        get twitchClipUrl(): string {
            // Uses the internal twitchClipSlug to construct the iframe URL
            return `https://clips.twitch.tv/embed?clip=${this.twitchClipSlug}&parent=dash.bingothon.com&autoplay=true`;
        }

        mounted() {
            this.$nextTick(() => {
                nodecg.listenFor('playTwitchClip', this.playClip);
                nodecg.listenFor('stopTwitchClip', this.stopClip);
            });
        }

        async fetchTwitchClipDuration(slug: string) {
            console.log(`Making a request to fetch duration of clip ${slug}`);
            // Construct the request data object for the twitchAPIRequest
            const requestData = {
                method: 'GET', // HTTP method for the request
                endpoint: `/clips?id=${slug}`, // Twitch API endpoint for clips
                data: {}, // Additional data for the request, if needed
                newAPI: true // Specify if this is for the new Twitch API
            };

            try {
                // Wrap the sendMessageToBundle call in a Promise to be able to use await
                const response = await new Promise((resolve, reject) => {
                    nodecg.sendMessageToBundle(
                        'twitchClipDurationRequest',
                        'nodecg-speedcontrol',
                        requestData,
                        (err, response) => {
                            if (err) {
                                console.error('Error fetching Twitch clip duration:', err);
                                reject(err);
                            } else {
                                console.log('Twitch clip duration response:', response);
                                resolve(response);
                            }
                        }
                    );
                });

                // Process the response to set the clip duration
                if (response) {
                    console.log('Setting clip duration to', response);
                    this.durationInMilliseconds = parseFloat(response as string) * 1000;
                } else {
                    this.durationInMilliseconds = 60 * 1000;
                }
            } catch (error) {
                console.error('Caught error:', error);
            }
        }

        private playClip(slug: string) {
            this.twitchClipSlug = slug;
            this.isShown = true;
            this.iframeKey++; // reset iframe to force reload because people might want to repeat the smae clip a couple of times

            // Replace clientId and accessToken with actual values
            this.fetchTwitchClipDuration(slug).then(() => {
                setTimeout(() => {
                    this.isShown = false;
                }, this.durationInMilliseconds || 60 * 1000);
            });
        }

        private stopClip() {
            this.isShown = false; // Use the internal property instead of the prop
        }
    }
</script>

<style scoped>
    .twitch-clip-embed {
        position: absolute;
        left: 718px;
        top: 240px;
        width: 1172px;
        height: 660px;
    }
</style>
