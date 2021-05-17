<template>
    <v-app>
		<span v-if="hostsSpeakingDuringIntermission">Hosts are currently speaking!</span>
		<span>Last intermission: {{ timeSinceLastIntermission }}</span>
		<span>Playing ads for {{ adTimer }} seconds</span>
		<div v-if="obsConnectionStatus === 'disconnected'">
			Currently disconnected :(
		</div>
		<div v-if="obsConnectionStatus === 'error'">
			OBS connection error monkaS
		</div>
		<div v-if="obsConnectionStatus === 'disabled'">
			OBS is disabled, nothing to see here
		</div>
		<div v-if="obsConnectionStatus === 'connected'">
			Current Scene: {{ currentScene }}
			<v-select v-model="previewScene" :items="sceneNameList">
			</v-select>
			<v-btn @click="doTransition" :disabled="adTimer > 0">
				{{ transitionText }}
			</v-btn>
			<div>
				Audio Preset:
				<v-row>
					<v-radio-group
						v-model="obsStreamMode"
						:value="obsStreamMode"
					>
						<v-col v-for="mode in obsStreamModes">
							<v-radio
                                :id="`mode-${mode}`"
                                :key="mode"
                                :value="mode"
                                :label="mode"
                                @change="changeOBSStreamMode(mode)"
                            />
                        </v-col>
                    </v-radio-group>
                </v-row>
            </div>
            <div
                v-for="(audio, i) in obsAudioSources"
                :key="i"
            >
                {{ audio[0] }}:
                <v-row>
                    <v-col>
                        <v-slider
                            :value="audio[1].baseVolume*100"
                            @change="updateAudioSourceBaseVolume(audio[0], $event)"
                        />
                    </v-col>
                    <v-col>
                        <v-btn
                            :disabled="!canTriggerAudioFade(audio[1].fading)"
                            @click="toggleAudioFade(audio[0])"
                        >
                            <v-icon v-if="toggleAudioFadeText(audio[1].fading)">
                                mdi-volume-off
                            </v-icon>
                            <v-icon v-else>
                                mdi-volume-high
                            </v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </div>
        </div>
    </v-app>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import {nodecg} from '../../browser-util/nodecg';
import {
	ObsDashboardAudioSources, DiscordDelayInfo, ObsStreamMode,
} from '../../../schemas';
import twitchCommercialTimer from '../../../speedcontrol-types'
import {store, getReplicant} from '../../browser-util/state';

const bundleName = 'bingothon-layouts';

@Component({})
export default class OBSControl extends Vue {

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

	get transitionText(): string {
		if (this.adTimer > 0) {
			return 'Twitch Ads playing for ' + this.adTimer + ' seconds';
		}
		return 'Transition'
	}

	get adTimer(): number {
		return store.state.twitchCommericalTimer.secondsRemaining;
	}

	get obsStreamModes(): ObsStreamMode[] {
		return ['external-commentary', 'runner-commentary', 'racer-audio-only'];
	}

	get hostsSpeakingDuringIntermission(): boolean {
		return store.state.hostsSpeakingDuringIntermission.speaking;
	}

	get obsConnectionStatus(): string {
        return store.state.obsConnection.status;
    }

    get currentScene(): string {
        return store.state.obsCurrentScene;
    }

    get previewScene(): string {
        return store.state.obsPreviewScene;
    }

    set previewScene(scene: string) {
        getReplicant('obsPreviewScene').value = scene;
    }

    get obsAudioSources(): [string, any][] {
        return Object.entries(store.state.obsDashboardAudioSources);
    }

    updateAudioSourceBaseVolume(audioSource: string, newVal: number) {
        getReplicant<ObsDashboardAudioSources>('obsDashboardAudioSources').value[audioSource].baseVolume = newVal / 100;
    }

    get sceneNameList(): string[] {
        return store.state.obsSceneList.map(s => s.name);
    }

    get discordAudioDelay(): string {
        return `${store.state.discordDelayInfo.discordAudioDelayMs}`;
    }

    set discordAudioDelay(delay: string) {
        getReplicant<DiscordDelayInfo>('discordDelayInfo').value.discordAudioDelayMs = parseInt(delay, 10);
    }

    get discordAudioDelaySync(): boolean {
        return store.state.discordDelayInfo.discordAudioDelaySyncStreamLeader;
    }

    set discordAudioDelaySync(sync: boolean) {
        getReplicant<DiscordDelayInfo>('discordDelayInfo').value.discordAudioDelaySyncStreamLeader = sync;
    }

    get discordDisplayDelay(): string {
        return `${store.state.discordDelayInfo.discordDisplayDelayMs}`;
    }

    set discordDisplayDelay(delay: string) {
        getReplicant<DiscordDelayInfo>('discordDelayInfo').value.discordDisplayDelayMs = parseInt(delay, 10);
    }

    get discordDisplayDelaySync(): boolean {
        return store.state.discordDelayInfo.discordDisplayDelaySyncStreamLeader;
    }

    set discordDisplayDelaySync(sync: boolean) {
        getReplicant<DiscordDelayInfo>('discordDelayInfo').value.discordDisplayDelaySyncStreamLeader = sync;
    }

    get obsStreamMode(): ObsStreamMode {
        return store.state.obsStreamMode;
    }

    set obsStreamMode(mode: ObsStreamMode) {
        getReplicant<ObsStreamMode>('obsStreamMode').value = mode;
    }

    changeOBSStreamMode(mode: ObsStreamMode) {
        getReplicant<ObsStreamMode>('obsStreamMode').value = mode;
    }

    doTransition() {
        nodecg.sendMessageToBundle('obs:transition', bundleName);
    }

    toggleAudioFade(source: string) {
        if (store.state.obsDashboardAudioSources[source].fading === 'muted') {
            nodecg.sendMessageToBundle('obsRemotecontrol:fadeInAudio', bundleName, {source});
        } else {
            nodecg.sendMessageToBundle('obsRemotecontrol:fadeOutAudio', bundleName, {source});
        }
    }

    toggleAudioFadeText(fade: string): boolean {
        switch (fade) {
            case 'fadein':
                return true;
            case 'fadeout':
                return false;
            case 'muted':
                return false;
            case 'unmuted':
                return true;
            default:
                return false;
        }
    }

    canTriggerAudioFade(fade: string): boolean {
        return ['muted', 'unmuted'].includes(fade);
    }
}
</script>

<style>
.error-warning {
    color: red;
    font-size: small;
}
</style>
