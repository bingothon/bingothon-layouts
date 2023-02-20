<template>
    <router-view></router-view>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { nodecg } from '../../browser-util/nodecg'
    import { CapturePositions } from '../../../schemas'
    import { Route } from 'vue-router/types/router'

    @Component({})
    export default class GameLayout extends Vue {
        mounted(): void {
            this.layoutChanged(this.$route)
            this.$router.afterEach(async (to) => {
                try {
                    await Vue.nextTick()
                    this.layoutChanged(to)
                } catch (err) {
                    // Not sure if this will error but better be safe
                }
            })
        }

        layoutChanged(route: Route): void {
            // Is the last replace needed?
            const code = route.path.replace('/', '').replace('*', '')
            this.updateCapturePositionData(code)
        }

        updateCapturePositionData(layout: string): void {
            const capturePositions = nodecg.Replicant<CapturePositions>('capturePositions')
            NodeCG.waitForReplicants(capturePositions).then(() => {
                if (!capturePositions.value) {
                    return
                }
                const captureElems = document.getElementsByClassName('TwitchPlayerContainer') // TODO: get rid of twitch
                const pos: { [k: string]: { x: number; y: number; width: number; height: number } } = {}

                for (const el of captureElems) {
                    const sizes = el.getBoundingClientRect()

                    // Get the widths of all the borders to figure out the position/size without them.
                    const topBorder = getComputedStyle(el).getPropertyValue('border-top-width')
                    const rightBorder = getComputedStyle(el).getPropertyValue('border-right-width')
                    const bottomBorder = getComputedStyle(el).getPropertyValue('border-bottom-width')
                    const leftBorder = getComputedStyle(el).getPropertyValue('border-left-width')
                    const calcSizes = {
                        x: sizes.x + parseInt(leftBorder, 10),
                        y: sizes.y + parseInt(topBorder, 10),
                        width: sizes.width - parseInt(rightBorder, 10) - parseInt(leftBorder, 10),
                        height: sizes.height - parseInt(bottomBorder, 10) - parseInt(topBorder, 10),
                    }
                    pos[el.id] = calcSizes
                }

                capturePositions.value[layout] = pos
            })
        }
    }
</script>
