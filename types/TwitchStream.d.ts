export type TwitchStream = {
    channel: string
    widthPercent: number
    heightPercent: number
    topPercent: number
    leftPercent: number
    quality: string
    volume: number
    paused: boolean
    delay: number
    availableQualities: {
        name: string
        group: string
    }[]
}
