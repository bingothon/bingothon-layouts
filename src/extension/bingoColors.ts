// not sure if a seperate file for this is needed, maybe refactor
import * as nodecgApiContext from './util/nodecg-api-context'
import { BingoboardMeta, BingoboardMode } from '../../schemas'
import { BoardColor } from '../../types'
import { RunDataActiveRun } from '../../speedcontrol-types'

const nodecg = nodecgApiContext.get()
const boardMetaRep = nodecg.Replicant<BingoboardMeta>('bingoboardMeta')
const bingoboardMode = nodecg.Replicant<BingoboardMode>('bingoboardMode')
const runDataActiveRunRep = nodecg.Replicant<RunDataActiveRun>('runDataActiveRun', 'nodecg-speedcontrol')

// const log = new nodecg.Logger(`${nodecg.bundleName}:bingoColors`);

const ALL_COLORS: BoardColor[] = ['pink', 'red', 'orange', 'brown', 'yellow', 'green', 'teal', 'blue', 'navy', 'purple']

nodecg.listenFor('timerStart', 'nodecg-speedcontrol', (): void => {
    boardMetaRep.value.boardHidden = false
})
boardMetaRep.once('change', (): void => {
    runDataActiveRunRep.on('change', (newValue, old): void => {
        // bail on server restart
        if (!newValue || !old) return
        // bail if this is still the old run and the player's haven't changed (still rerun this is the player count changes)'
        if (newValue.id === old.id && newValue.teams.length === old.teams.length) return
        // Hide board when new run starts
        boardMetaRep.value.boardHidden = true

        // default colors for players
        const newBingoColors: BoardColor[] = []
        if (newValue.teams) {
            newValue.teams.forEach((team, i): void => {
                team.players.forEach((): void => {
                    newBingoColors.push(ALL_COLORS[i])
                })
            })
        }
        boardMetaRep.value.playerColors = newBingoColors

        // set other useful defaults
        if (newValue.customData && newValue.customData.Bingotype) {
            const bingotype = newValue.customData.Bingotype
            if (bingotype.startsWith('single')) {
                boardMetaRep.value.countShown = false
            } else if (bingotype.startsWith('blackout')) {
                boardMetaRep.value.countShown = true
            }
        }

        // reset bingoboard mode
        bingoboardMode.value.boardMode = 'normal'
        bingoboardMode.value.markerRedirects = []
    })
})
