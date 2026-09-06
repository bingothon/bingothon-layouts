import { runDataActiveRunRep } from './util/speedControlReplicants';
import { RunData, RunDataPlayer } from 'nodecg/bundles/bingothon-layouts/speedcontrol-types';
import { capturePositionsRep, currentGameLayoutRep, playerSlotsRep, soundOnTwitchStream, streamsReplicant } from './util/replicants';
import { setInterval } from 'node:timers';
import * as nodecgApiContext from './util/nodecg-api-context';

const nodecg = nodecgApiContext.get();
const DEFAULT_CYCLE_INTERVAL_S = 60 * 10;
let cycleTimer: NodeJS.Timeout | undefined = undefined;

// flatly maps all players to their id
function playersMap(runData: RunData): { [id: string]: RunDataPlayer } {
    const playerMap: { [id: string]: RunDataPlayer } = {};
    runDataActiveRunRep.value?.teams.forEach((team) => team.players.forEach((player) => (playerMap[player.id] = player)), {});
    return playerMap;
}

// gets the index of the stream with the given player id
function streamIndex(playerId: string | null): number {
    if (!playerId) return -1;
    return streamsReplicant.value.findIndex((stream) => stream.playerId === playerId);
}

function maxStreamsForCurrentLayout(): number {
    const run = runDataActiveRunRep.value;
    if (!run) return -1;
    switch (playerSlotsRep.value.source) {
        case 'run':
            return Object.keys(playersMap(run)).length;
        case 'relay':
            return runDataActiveRunRep.value?.teams.length || 0;
        case 'race': {
            const currentLayout = currentGameLayoutRep.value;
            const positions = capturePositionsRep.value[currentLayout.name];
            return Object.keys(positions).length;
        }
    }
}

// recomputes the slots of the playerSlot replicant
function recomputePlayerSlots(): void {
    const playerSlots = playerSlotsRep.value;
    const run = runDataActiveRunRep.value;

    if (!run?.teams) {
        return;
    }

    const soundSlot = playerSlots.slots.findIndex((slot) => streamIndex(slot.playerId) === soundOnTwitchStream.value);
    const maxStreams = maxStreamsForCurrentLayout();

    while (playerSlots.slots.length < maxStreams) {
        playerSlots.slots.push({ playerId: null, pinned: false });
    }
    playerSlots.slots.length = maxStreams;

    switch (playerSlots.source) {
        case 'run':
            playerSlots.slots.forEach((slot, i) => (slot.playerId = playerSlots.pool[i] || null));
            break;
        case 'relay':
            playerSlots.slots.forEach((slot, i) => {
                const team = run.teams[i];
                slot.playerId = team.relayPlayerID || team.players[0].id || null;
            });
            break;
        case 'race': {
            const pinnedPlayers = playerSlots.slots.filter((slot) => slot.pinned).map((slot) => slot.playerId);
            const rotation = playerSlots.pool.filter((player) => !pinnedPlayers.includes(player));
            if (rotation.length > 0) {
                playerSlots.cursor = playerSlots.cursor % rotation.length;
            }
            let k = playerSlots.cursor;
            playerSlots.slots.forEach((slot) => {
                // skip over currently pinned slots
                if (slot.pinned) {
                    return;
                }
                // Next player in rotation or wrap around to beginning
                slot.playerId = rotation.length > 0 ? rotation[k++ % rotation.length] : null;
            });
        }
    }

    playerSlotsRep.value = playerSlots;
    applyVisibility(soundSlot);
}

function applyVisibility(soundSlot: number): void {
    const activePlayers = new Set(playerSlotsRep.value.slots.map((slot) => slot.playerId));
    const streams = streamsReplicant.value;
    streams.forEach((stream) => {
        stream.visible = activePlayers.has(stream.playerId);
    });
    if (soundSlot >= 0) {
        soundOnTwitchStream.value = streamIndex(playerSlotsRep.value.slots[soundSlot].playerId);
    } else if (soundOnTwitchStream.value >= 0 && !activePlayers.has(streamsReplicant.value[soundOnTwitchStream.value].playerId)) {
        soundOnTwitchStream.value = -1;
    }
    streamsReplicant.value = streams;
}

function nextCycle(): void {
    const playerSlots = playerSlotsRep.value;
    if (playerSlots.source !== 'race') {
        return;
    }

    const pinnedPlayers = playerSlots.slots.filter((slot) => slot.pinned).map((slot) => slot.playerId);
    const rotation = playerSlots.pool.filter((player) => !pinnedPlayers.includes(player));

    if (rotation.length > 0) {
        // Count how many slots actually need to be filled in this page
        const unpinnedCount = playerSlots.slots.filter((slot) => !slot.pinned).length;

        // Advance the cursor by the page size and wrap around the rotation pool
        playerSlots.cursor = (playerSlots.cursor + unpinnedCount) % rotation.length;

        recomputePlayerSlots();
    }
}

runDataActiveRunRep.on('change', (newVal, oldVal) => {
    if (!newVal || !oldVal) {
        return;
    }
    // New run, completely reset playerSlots
    if (newVal.id != oldVal.id) {
        playerSlotsRep.value = {
            slots: [],
            pool: Object.keys(playersMap(newVal)),
            cursor: 0,
            source: newVal.relay ? 'relay' : 'run',
            autoCycle: false,
            cycleIntervalSeconds: DEFAULT_CYCLE_INTERVAL_S
        };
    }

    recomputePlayerSlots();
});

currentGameLayoutRep.on('change', (newVal) => {
    if (!newVal) return;
    recomputePlayerSlots();
});

streamsReplicant.on('change', (newVal) => {
    if (!newVal) return;
    applyVisibility(-1);
});

nodecg.listenFor('playerSlots:setSource', (source: 'run' | 'relay' | 'race') => {
    if (source === playerSlotsRep.value.source) {
        return;
    }
    playerSlotsRep.value.source = source;
    recomputePlayerSlots();
});

nodecg.listenFor('playerSlots:setSlotPlayer', async (data: { slot: number; playerId: string }) => {
    if (playerSlotsRep.value.source === 'relay') {
        const run = runDataActiveRunRep.value;
        if (!run) {
            return;
        }
        nodecg.sendMessageToBundle('modifyRelayPlayerID', 'nodecg-speedcontrol', {
            runId: run.id,
            teamIndex: run.teams[data.slot].id,
            playerId: data.playerId
        });
    } else {
        playerSlotsRep.value.slots[data.slot % playerSlotsRep.value.slots.length] = { playerId: data.playerId, pinned: false };
    }
    recomputePlayerSlots();
});

nodecg.listenFor('playerSlots:setSlotPinned', (data: { slot: number; pinned: boolean }) => {
    playerSlotsRep.value.slots[data.slot % playerSlotsRep.value.slots.length].pinned = data.pinned;
});

nodecg.listenFor('playerSlots:cycleNow', () => {
    if (cycleTimer) {
        cycleTimer.refresh();
    }
    nextCycle();
});

nodecg.listenFor('playerSlots:setAutoCycle', (data: { enabled: boolean; intervalSeconds?: number }) => {
    if (!data) {
        return;
    }
    if (!data.enabled) {
        clearInterval(cycleTimer);
        cycleTimer = undefined;
    } else {
        if (cycleTimer) {
            clearInterval(cycleTimer);
        }
        cycleTimer = setInterval(
            () => {
                nextCycle();
            },
            data.intervalSeconds ? data.intervalSeconds * 1000 : playerSlotsRep.value.cycleIntervalSeconds * 1000 || DEFAULT_CYCLE_INTERVAL_S * 1000
        );
    }
});
