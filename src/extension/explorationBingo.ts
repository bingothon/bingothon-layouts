import * as nodecgApiContext from './util/nodecg-api-context'
import { boardMetaRep, explorationBoardRep } from './util/replicants'
import { ExplorationBingoboardCell } from '../../types'

const nodecg = nodecgApiContext.get()

const defaultEmptyColorCounts = {
    pink: 0,
    red: 0,
    orange: 0,
    brown: 0,
    yellow: 0,
    green: 0,
    teal: 0,
    blue: 0,
    navy: 0,
    purple: 0,
}

function getNeighbors(idx: number): number[] {
    const result = []
    if (idx - 5 >= 0) {
        result.push(idx - 5)
    }
    if (idx % 5 !== 0 && idx - 1 >= 0) {
        result.push(idx - 1)
    }
    if (idx + 5 < 25) {
        result.push(idx + 5)
    }
    if (idx % 5 !== 4 && idx + 1 < 25) {
        result.push(idx + 1)
    }
    return result
}

function updateVisibilities(): void {
    explorationBoardRep.value.cells.forEach((cell, idx, allCells): void => {
        /* eslint-disable no-param-reassign */
        if (idx === 6 || idx === 18 || getNeighbors(idx).some((i): boolean => allCells[i].colors !== 'blank')) {
            cell.name = cell.hiddenName
            cell.hidden = false
        } else {
            cell.name = ''
            cell.hidden = true
        }
        /* eslint-enable no-param-reassign */
    })
}

nodecg.listenFor('exploration:newGoals', (goals: string[], callback): void => {
    if (goals.length !== 25) {
        if (callback && !callback.handled) {
            callback(new Error('There have to be exactly 25 goals!'))
        }
    } else {
        // reset counts and colors
        const cells = goals.map(
            (g, idx): ExplorationBingoboardCell => ({
                name: '',
                hiddenName: g,
                hidden: true,
                slot: `slot${idx}`,
                colors: 'blank',
            }),
        )
        explorationBoardRep.value = { colorCounts: defaultEmptyColorCounts, cells }
        updateVisibilities()
        if (callback && !callback.handled) {
            callback(null)
        }
    }
})

nodecg.listenFor('exploration:resetBoard', (_data, callback): void => {
    explorationBoardRep.value.colorCounts = defaultEmptyColorCounts
    explorationBoardRep.value.cells.forEach((cell, idx): void => {
        /* eslint-disable no-param-reassign */
        if (idx === 6 || idx === 18) {
            cell.name = cell.hiddenName
            cell.hidden = false
        } else {
            cell.name = ''
            cell.hidden = true
        }
        cell.colors = 'blank'
        /* eslint-enable no-param-reassign */
    })
    if (callback && !callback.handled) {
        callback(null)
    }
})

nodecg.listenFor('exploration:goalClicked', (goal, callback): void => {
    if (!goal || typeof goal.index !== 'number') {
        if (callback && !callback.handled) {
            callback(new Error('index of the goal has to be a number!'))
            return
        }
    }
    // only allow one color
    const playerColor = boardMetaRep.value.playerColors[0]
    const { index } = goal
    if (index < 0 || index >= 25) {
        if (callback && !callback.handled) {
            callback(new Error('index has to be between 0 (inclusive) and 25 (exclusive)'))
            return
        }
    }
    if (explorationBoardRep.value.cells[index].colors === 'blank') {
        explorationBoardRep.value.cells[index].colors = playerColor || 'red'
    } else {
        explorationBoardRep.value.cells[index].colors = 'blank'
    }
    updateVisibilities()
    if (callback && !callback.handled) {
        callback(null)
    }
})
