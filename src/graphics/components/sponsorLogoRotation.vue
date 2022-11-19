<template>
    <div>
        <transition name="fade" mode="in-out">
            <img v-if="currentLogo" :src="currentLogo.url" :key="currentLogo.url" />
        </transition>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from 'vue-property-decorator'

    import PlayerInfo from './playerInfo.vue'
    import TeamInfo from './teamInfo.vue'
    import { store } from '../../browser-util/state'
    import { Asset } from 'schemas'

    const ROTATION_INTERVAL_SECS = 15

    export enum LogoAssetType {
        wideSmallLogos = 'wideSmallLogos',
        wideLargeLogos = 'wideLargeLogos',
        squareLogos = 'squareLogos',
    }

    @Component({
        components: {
            PlayerInfo,
            TeamInfo,
        },
    })
    export default class SponsorLogoRotation extends Vue {
        @Prop({ required: true, default: LogoAssetType.wideSmallLogos })
        logoAssetType: LogoAssetType

        currentIdx = 0
        changeInterval: NodeJS.Timeout

        mounted() {
            this.changeInterval = setInterval(() => {
                if (this.logoAssets.length > 0) {
                    this.currentIdx = (this.currentIdx + 1) % this.logoAssets.length
                }
            }, ROTATION_INTERVAL_SECS * 1000)
        }

        unmount() {
            clearInterval(this.changeInterval)
        }

        get currentLogo(): Asset {
            return this.logoAssets[this.currentIdx]
        }

        get logoAssets(): Asset[] {
            return store.state[`assets:${this.logoAssetType}`]
        }
    }
</script>

<style scoped>
    img {
        height: 90%;
        width: 90%;
        object-fit: scale-down;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
    }

    /* local animation stuff */
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.25s;
    }
    .fade-enter,
    .fade-leave-to {
        opacity: 0;
    }
</style>
