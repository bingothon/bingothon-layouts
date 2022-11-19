<template>
    <router-view></router-view>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { nodecg } from '../../browser-util/nodecg'
    import { ObsDashboardAudioSources, DiscordDelayInfo, ObsStreamMode } from '../../../schemas'
    import { store, getReplicant } from '../../browser-util/state'

    const bundleName = 'bingothon-layouts'

    @Component({})
    export default class Interview extends Vue {}
</script>
