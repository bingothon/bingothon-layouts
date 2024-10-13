import * as nodecgApiContext from './util/nodecg-api-context';
import { scorePlayers } from '@/util/replicants';

const nodecg = nodecgApiContext.get();

// get player data from config
scorePlayers.value = nodecg.bundleConfig.scorePlayers.map((player, index) => ({
    discord: player.discord,
    discordProfileUrl: player.discordProfileUrl,
    displayName: player.displayName,
    pronouns: player.pronouns,
    twitch: player.twitch,
    score: scorePlayers.value.at(index)?.score ?? 0,
}));