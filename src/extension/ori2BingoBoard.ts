import * as RequestPromise from 'request-promise'

import * as nodecgApiContext from './util/nodecg-api-context'
import {OriBingoboard, BingoboardMeta, Ori2BingoMeta} from '../../schemas'
import {BoardColor, ExplorationBingoboardCell, Ori2BingoBoard} from '../../types'

const nodecg = nodecgApiContext.get()
const log = new nodecg.Logger(`${nodecg.bundleName}:ori2Bingo`)
const request = RequestPromise.defaults({jar: true})
const boardRep = nodecg.Replicant<OriBingoboard>('oriBingoboard')
const boardMetaRep = nodecg.Replicant<BingoboardMeta>('bingoboardMeta')
const oriBingoMeta = nodecg.Replicant<Ori2BingoMeta>('ori2BingoMeta')

let updateLoopTimer: NodeJS.Timer | null = null

async function fetchBoard(token: string = oriBingoMeta.value.token): Promise<Ori2BingoBoard> {
  return request.get(`https://${oriBingoMeta.value.host ?? 'wotw.orirando.com'}/api/bingothon/${token}`, {json: true})
}

function createEmptyBoard(boardSize: number = 5) {
  const cells: ExplorationBingoboardCell[] = []

  for (let i = 0; i < boardSize * boardSize; i += 1) {
    cells.push({name: '', hidden: true, hiddenName: '', colors: 'blank', slot: `slot${i}`})
  }

  return cells
}

function init(): void {
  boardRep.value.cells = createEmptyBoard(5)
}

async function updateBingoBoard(): Promise<void> {
  try {
    const board = await fetchBoard()
    const cells = createEmptyBoard(board.size)

    // Map universe IDs to colors and count
    const colorByUniverseId: { [universeId: number]: BoardColor } = {}
    const squareCountByColor: { [color: string]: number } = {}
    const availableColors = [...boardMetaRep.value.playerColors]

    for (const universe of board.universes) {
      const color = availableColors.shift() ?? 'red'
      colorByUniverseId[universe.id] = color

      // When there are more universes than available colors this
      // will produce incorrect results. Fine for now.
      squareCountByColor[color] = universe.squares
    }

    // Update color counts
    for (const color of Object.keys(boardRep.value.colorCounts)) {
      boardRep.value.colorCounts[color] = squareCountByColor[color] ?? 0
    }

    // Load values into squares/cells
    for (const square of board.squares) {
      const index = (square.position.y - 1) * board.size + square.position.x
      cells[index].hidden = false
      cells[index].name = square.text
      cells[index].colors = square.completedBy.map(universeId => colorByUniverseId[universeId]).join(' ') || 'blank'
    }

    boardRep.value.cells = cells
  } catch (e) {
    log.error(e)
  }
}

// recover the room at server restart
function recover(): void {
  oriBingoMeta.once('change', async (meta): Promise<void> => {
    if (!meta.active) return

    try {
      await fetchBoard(meta.token)
      updateLoopTimer = setInterval(updateBingoBoard, 3000)

      log.info('Successfully recovered connection to Ori2 Board')
    } catch (e) {
      log.error('Can\'t recover connection to Ori2 Board!', e)
    }
  })
}

nodecg.listenFor('ori2Bingo:activate', async (meta: Ori2BingoMeta, callback): Promise<void> => {
  try {
    if (updateLoopTimer) {
      clearTimeout(updateLoopTimer)
    }

    await fetchBoard(meta.token)
    oriBingoMeta.value.active = true
    updateLoopTimer = setInterval(updateBingoBoard, 3000)

    if (callback && !callback.handled) {
      callback()
    }
  } catch (error) {
    log.error(error)
    if (callback && !callback.handled) {
      callback(error)
    }
  }
})

nodecg.listenFor('ori2Bingo:deactivate', async (_data, callback): Promise<void> => {
  oriBingoMeta.value.active = false

  if (updateLoopTimer) {
    clearInterval(updateLoopTimer)
  }

  if (callback && !callback.handled) {
    callback()
  }
})

init()
recover()
