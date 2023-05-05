import * as RequestPromise from 'request-promise'

import * as nodecgApiContext from '../util/nodecg-api-context'
import { BingoboardMeta, ExternalBingoboard, ExternalBingoboardMeta } from '../../../schemas'
import { BoardColor, ExplorationBingoboardCell } from '../../../types'
import { ExternalBingoboardManager } from '@/externalBingoboards'
import { ReplicantServer } from 'nodecg/types/server'

const nodecg = nodecgApiContext.get()
const log = new nodecg.Logger(`${nodecg.bundleName}:ori2Bingo`)
const request = RequestPromise.defaults({ jar: true })
const boardMetaRep = nodecg.Replicant<BingoboardMeta>('bingoboardMeta')

const ALL_COLORS: readonly BoardColor[] = Object.freeze(['pink', 'red', 'orange', 'brown', 'yellow', 'green', 'teal', 'blue', 'navy', 'purple'])

type Position = {
    x: number
    y: number
}

type Ori2BingoSquare = {
    position: Position
    text: string
    html: string
    universeIds: number[]
    completedBy: number[]
}

type Ori2BingoUniverse = {
    universeId: number
    lines: number
    squares: number
}

type Ori2BingoBoard = {
    size: number
    universes: Ori2BingoUniverse[]
    squares: Ori2BingoSquare[]
}

async function fetchBoard(token: string, host?: string): Promise<Ori2BingoBoard> {
    return request.get(`https://${host || 'wotw.orirando.com'}/api/bingothon/${token}`, { json: true })
}

function createEmptyBoard(boardSize = 5) {
    const cells: ExplorationBingoboardCell[] = []

    for (let i = 0; i < boardSize * boardSize; i += 1) {
        cells.push({
            name: '',
            hidden: true,
            hiddenName: '',
            colors: 'blank',
            slot: `slot${i}`,
        })
    }

    return cells
}

type Ori2Meta = ExternalBingoboardMeta & { game: 'ori2' }

export class Ori2ExternalBingoboard implements ExternalBingoboardManager {
    updateLoopTimer?: NodeJS.Timer
    meta?: Ori2Meta
    constructor(private boardRep: ReplicantServer<ExternalBingoboard>) {}
    async configure(meta: ExternalBingoboardMeta): Promise<void> {
        if (meta.game !== 'ori2') {
            log.error('tried to configure ori2 bingo but game is something else!')
            return
        }
        // if (!meta.token) {
        //   throw new Error("invalid config!");
        // }
        log.info('configuring ori2', meta)
        this.meta = meta
        await this.updateBingoBoard()
        if (!this.updateLoopTimer) {
            this.updateLoopTimer = setInterval(() => {
                if (this.meta) {
                    this.updateBingoBoard().catch((e) => {
                        log.error('ori1 update error:', e)
                    })
                }
            }, 3000)
        }
    }

    async updateBingoBoard(): Promise<void> {
        if (!this.meta) {
            log.error('meta is undefined!')
            return
        }
        const board = await fetchBoard(this.meta.token, this.meta.host)
        const cells = createEmptyBoard(board.size)

        // Map universe IDs to colors and count
        const colorByUniverseId: { [universeId: number]: BoardColor } = {}
        const squareCountByColor: { [color: string]: number } = {}
        const availableColors = [...boardMetaRep.value.playerColors]

        for (const universe of board.universes) {
            const color = availableColors.shift() ?? 'red'
            colorByUniverseId[universe.universeId] = color

            // When there are more universes than available colors this
            // will produce incorrect results. Fine for now.
            squareCountByColor[color] = universe.squares
        }

        // Update color counts
        for (const color of ALL_COLORS) {
            this.boardRep.value.colorCounts[color] = squareCountByColor[color] ?? 0
        }

        // Load values into squares/cells
        for (const square of board.squares) {
            const index = (square.position.y - 1) * board.size + square.position.x - 1
            cells[index].hidden = false
            cells[index].name = square.html
            cells[index].colors = square.completedBy.map((universeId) => colorByUniverseId[universeId]).join(' ') || 'blank'
        }

        this.boardRep.value.cells = cells
    }

    deactivate(): Promise<void> {
        if (this.updateLoopTimer) {
            clearInterval(this.updateLoopTimer)
            this.updateLoopTimer = undefined
        }
        return Promise.resolve()
    }
}
