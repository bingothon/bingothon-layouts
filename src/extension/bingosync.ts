// Based on https://github.com/GamesDoneQuick/sgdq18-layouts/blob/master/src/extension/oot-bingo.ts
// Packages
import * as RequestPromise from 'request-promise'
import WebSocket from 'ws'

// Ours
import { Replicant } from 'nodecg/types/server' // eslint-disable-line import/no-extraneous-dependencies
import * as nodecgApiContext from './util/nodecg-api-context'
import { Bingoboard, BingoboardMeta, BingoboardMode, BingosyncSocket } from '@/schemas'

import equal from 'deep-equal'
import clone from 'clone'
import { InvasionContext } from './util/invasion'
import { BingoboardCell, BingosyncCell, BoardColor } from '../../types'
import { RunDataActiveRun, RunDataPlayer, RunDataTeam } from '../../speedcontrol-types'

const nodecg = nodecgApiContext.get()
const log = new nodecg.Logger(`${nodecg.bundleName}:bingosync`)
const boardMetaRep = nodecg.Replicant<BingoboardMeta>('bingoboardMeta')

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {} // tslint:disable-line:no-empty
const bingosyncSocketUrl = 'wss://sockets.bingosync.com'
const bingosyncSiteUrl = 'https://bingosync.com'
const runData = nodecg.Replicant<RunDataActiveRun>('runDataActiveRun', 'nodecg-speedcontrol')
const lockoutVariants = ['lockout', 'draftlockout', 'invasion', 'connect5']

const ALL_COLORS: readonly BoardColor[] = Object.freeze(['pink', 'red', 'orange', 'brown', 'yellow', 'green', 'teal', 'blue', 'navy', 'purple'])

// recover().catch((error) => {
//  log.error(`Failed to recover connection to room ${socketRep.value.roomCode}:`, error);
// });

const BINGOSYNC_ROOM_URL_RE = /^(.+)\/room\/([0-9a-zA-Z_-]+)$/g
const BINGOSYNC_SLUG_RE = /^[0-9a-zA-Z_-]+$/g

const SOCKET_URLS: Record<string, string> = Object.freeze({
    'https://bingosync.com': 'wss://sockets.bingosync.com',
    'https://bingosync.bingothon.com': 'wss://bingosock.bingothon.com',
})

class BingosyncManager {
    private request = RequestPromise.defaults({ jar: true })

    // <= Automatically saves and re-uses cookies.
    // interval for a complete update to not miss stuff
    private fullUpdateInterval: NodeJS.Timer | undefined

    // interval the fullUpdate function uses to make sure
    // there wasn't an event that cancels the interval
    private tempFullUpdateInterval: NodeJS.Timer | undefined

    private websocket: WebSocket | null = null

    private invasionCtx: InvasionContext | null = null

    public constructor(
        public name: string,
        public boardRep: Replicant<Bingoboard>,
        public socketRep: Replicant<BingosyncSocket>,
        public boardModeRep: Replicant<BingoboardMode> | null,
    ) {
        this.boardModeRep?.on('change', (newVal) => {
            log.info(newVal)
            if (newVal.boardMode === 'invasion') {
                if (this.invasionCtx === null) {
                    const playerColors = boardMetaRep.value.playerColors
                    this.invasionCtx = new InvasionContext(playerColors[0] || 'red', playerColors[1] || 'orange')
                    this.invasionCtx.initSides(this.boardRep.value.cells)
                }
            } else {
                this.invasionCtx = null
            }
            if (this.boardRep.value.cells.length == 25) {
                this.fullUpdateMarkers()
            }
        })
        boardMetaRep.on('change', (newVal) => {
            if (this.invasionCtx !== null) {
                this.invasionCtx.setPlayerColor1(newVal.playerColors[0] || 'red')
                this.invasionCtx.setPlayerColor2(newVal.playerColors[1] || 'orange')
            }
        })
        // recovering past connection
        // catch startup errors when this is all empty
        if (!this.socketRep.value || !this.socketRep.value.roomCode || !this.socketRep.value.passphrase) {
            if (!this.socketRep.value) {
                this.socketRep.value = { status: 'disconnected' }
                return
            }
            this.socketRep.value.status = 'disconnected'
        }
        // Restore previous connection on startup
        const { roomCode, passphrase, siteUrl, socketUrl } = this.socketRep.value
        if (roomCode && passphrase && siteUrl) {
            log.info(`Recovering connection to room ${this.socketRep.value.roomCode}`)
            this.joinRoom(roomCode, siteUrl, socketUrl, passphrase)
                .then((): void => {
                    log.info(`Successfully recovered connection to room ${this.socketRep.value.roomCode}`)
                })
                .catch((e): void => {
                    this.socketRep.value.status = 'error'
                    log.error(`Couldn't join room ${this.socketRep.value.roomCode}`, e)
                })
        }
    }

    public async joinRoomUrlOrCode(roomUrlOrCode: string, passphrase: string): Promise<void> {
        let siteUrl = bingosyncSiteUrl
        let socketUrl: string | undefined = bingosyncSocketUrl
        let roomCode: string
        if (BINGOSYNC_SLUG_RE.test(roomUrlOrCode)) {
            // this is only the code, assume standard bingosync
            roomCode = roomUrlOrCode
        } else {
            const match = BINGOSYNC_ROOM_URL_RE.exec(roomUrlOrCode)
            if (match === null) {
                throw new Error('can only join room with room code or url!!')
            }
            siteUrl = match[1]
            // if the site is not one of the known urls, we get undefined
            // that's fine, we try to get the socket url from the api
            socketUrl = SOCKET_URLS[siteUrl]
            roomCode = match[2]
        }
        await this.joinRoom(roomCode, siteUrl, socketUrl, passphrase)
    }

    /**
     * connects to the room, sets up everything basically
     * @param roomCode Can be only the roomcode or the entire url
     * @param passphrase the password
     * @param siteUrl url for the bingosync website
     * @param socketUrl url for the bingosync socket
     */
    public async joinRoom(roomCode: string, siteUrl: string, socketUrl: string | undefined, passphrase: string): Promise<void> {
        this.socketRep.value.siteUrl = siteUrl
        this.socketRep.value.socketUrl = socketUrl
        this.socketRep.value.passphrase = passphrase
        this.socketRep.value.roomCode = roomCode

        this.socketRep.value.status = 'connecting'
        if (this.fullUpdateInterval) {
            clearInterval(this.fullUpdateInterval)
        }
        this.destroyWebsocket()

        log.info('Fetching bingosync socket key...')
        const data = await this.request.post({
            uri: `${siteUrl}/api/join-room`,
            followAllRedirects: true,
            json: {
                room: roomCode,
                nickname: 'bingothon',
                password: passphrase,
            },
        })

        const socketKey = data.socket_key
        if (socketUrl === undefined) {
            // see: https://github.com/kbuzsaki/bingosync/pull/180
            socketUrl = data.sockets_url
            if (socketUrl === undefined) {
                throw new Error("unknown bingosync instance, couldn't get sockets url!")
            }
        }
        this.socketRep.value.socketUrl = socketUrl
        log.info('Got bingosync socket key!')

        const thisInterval = setInterval((): void => {
            this.fullUpdate(siteUrl, roomCode).catch((error): void => {
                log.error('Failed to fullUpdate:', error)
            })
        }, 60 * 1000)
        this.fullUpdateInterval = thisInterval
        this.tempFullUpdateInterval = thisInterval

        await this.fullUpdate(siteUrl, roomCode)
        await this.createWebsocket(socketUrl, socketKey)
    }

    public async leaveRoom(): Promise<void> {
        if (this.fullUpdateInterval) {
            clearInterval(this.fullUpdateInterval)
        }
        this.destroyWebsocket()
        this.socketRep.value.status = 'disconnected'
        this.socketRep.value.passphrase = ''
        this.socketRep.value.roomCode = ''
    }

    public forceRefreshInvasionCtx(): void {
        if (this.invasionCtx !== null) {
            this.invasionCtx.initSides(this.boardRep.value.cells)
            this.invasionCtx.setMarkers(this.boardRep.value.cells)
        }
    }

    public async fullUpdate(siteUrl: string, roomCode: string): Promise<void> {
        const bingosyncBoard: BingosyncCell[] = await this.request.get({
            uri: `${siteUrl}/room/${roomCode}/board`,
            json: true,
        })

        // Bail if the room changed while this request was in-flight.
        if (this.fullUpdateInterval !== this.tempFullUpdateInterval) {
            return
        }

        // make sure doubleclicks don't screw the number
        const goalCounts: { [key: string]: number } = {
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

        const newBoardState = bingosyncBoard.map((cell): BingoboardCell => {
            // remove blank cause that's not a color
            // count all the color occurences
            const newCell: BingoboardCell = {
                name: cell.name,
                slot: cell.slot,
                colors: [],
                markers: [null, null, null, null],
                rawColors: cell.colors,
            }
            newCell.rawColors.split(' ').forEach((color): void => {
                if (color !== 'blank') {
                    goalCounts[color] += 1
                }
            })
            this.processCellForMarkers(newCell)
            return newCell
        })

        if (this.invasionCtx !== null) {
            this.invasionCtx.updateSides(newBoardState)
            this.invasionCtx.setMarkers(newBoardState)
        }

        const runDataRep = nodecg.Replicant<RunDataActiveRun>('runDataActiveRun', 'nodecg-speedcontrol')

        if (this.boardModeRep && this.boardModeRep.value.boardMode === 'rowcontrol') {
            ALL_COLORS.forEach((color) => {
                this.updateRowControlScore(newBoardState, color)
            })
        } else if (runDataRep.value && runDataRep.value.customData.Bingotype === 'jsrflockout') {
            ALL_COLORS.forEach((color) => {
                this.updateJsrfLockoutScore(newBoardState, color)
            })
        } else {
            this.boardRep.value.colorCounts = goalCounts
        }

        // Bail if nothing has changed.
        if (equal(this.boardRep.value.cells, newBoardState)) {
            return
        }

        this.boardRep.value.cells = newBoardState
    }

    private fullUpdateMarkers(): void {
        const clonedCells = clone(this.boardRep.value.cells)
        clonedCells.forEach((cell: BingoboardCell): void => {
            cell.markers = [null, null, null, null]
            this.processCellForMarkers(cell)
        })

        if (this.invasionCtx !== null) {
            this.invasionCtx.updateSides(clonedCells)
            this.invasionCtx.setMarkers(clonedCells)
        }
        this.boardRep.value.cells = clonedCells
    }

    private processCellForMarkers(cell: BingoboardCell) {
        if (cell.rawColors === 'blank') {
            cell.colors = []
            return
        }
        const newColors: BoardColor[] = []
        const markers: [string | null, string | null, string | null, string | null] = [null, null, null, null]
        // each color could be overritten by a marker
        cell.rawColors.split(' ').forEach((color): void => {
            let redirected = false
            for (const [i, redirect] of this.boardModeRep?.value.markerRedirects.entries() || []) {
                if (color === redirect[0]) {
                    markers[i] = redirect[1]
                    redirected = true
                }
            }
            if (!redirected) {
                newColors.push(color as BoardColor)
            }
        })
        // if a cell has both a marker and is filled with the same color, drop the marker
        if (!this.boardModeRep?.value.alwaysShowMarkers) {
            markers.forEach((color, index) => {
                if (color !== null && newColors.includes(color as BoardColor)) {
                    markers[index] = null
                }
            })
        }
        cell.colors = newColors
        cell.markers = markers
    }

    public async createWebsocket(socketUrl: string, socketKey: string): Promise<void> {
        return new Promise((resolve, reject): void => {
            let settled = false

            log.info('Opening socket...')
            this.socketRep.value.status = 'connecting'
            this.websocket = new WebSocket(`${socketUrl}/broadcast`)

            this.websocket.onopen = (): void => {
                log.info('Socket opened.')
                if (this.websocket) {
                    this.websocket.send(JSON.stringify({ socket_key: socketKey }))
                }
            }

            this.websocket.onmessage = (event: { data: WebSocket.Data; type: string; target: WebSocket }): void => {
                let json
                try {
                    json = JSON.parse(event.data as string)
                } catch (error) {
                    // tslint:disable-line:no-unused
                    log.error('Failed to parse message:', event.data)
                }

                if (json.type === 'error') {
                    if (this.fullUpdateInterval) {
                        clearInterval(this.fullUpdateInterval)
                    }
                    this.destroyWebsocket()
                    this.socketRep.value.status = 'error'
                    log.error('Socket protocol error:', json.error ? json.error : json)
                    if (!settled) {
                        reject(new Error(json.error ? json.error : 'unknown error'))
                        settled = true
                    }
                    return
                }

                if (!settled) {
                    resolve()
                    this.socketRep.value.status = 'connected'
                    settled = true
                }

                if (json.type === 'goal') {
                    const index = parseInt(json.square.slot.slice(4), 10) - 1
                    const cell: BingoboardCell = {
                        name: json.square.name,
                        slot: json.square.slot,
                        colors: [],
                        markers: [null, null, null, null],
                        rawColors: json.square.colors,
                    }
                    this.processCellForMarkers(cell)
                    this.boardRep.value.cells[index] = cell
                    // update goal count
                    this.countScore(json)
                    //Check if conditions for lockout win are fulfilled and stop timer
                    if (
                        runData.value &&
                        ((lockoutVariants.includes(runData.value.customData.Bingotype) && this.boardRep.value.colorCounts[json.color] == 13) || //normal lockout up to 13
                            (runData.value.customData.Bingotype === 'rowcontrol' && this.boardRep.value.colorCounts[json.color] == 3))
                    ) {
                        //for rowcontrol, this can probably be simplified somehow
                        console.log('lockout AND 13 goals')
                        const colorTo13 = json.color
                        const playerIndex = boardMetaRep.value.playerColors.findIndex((color) => color == colorTo13)
                        let i = 0
                        let teamId = ''
                        const otherTeamIds: string[] = []
                        if (playerIndex >= 0) {
                            runData.value.teams.forEach((team: RunDataTeam) => {
                                team.players.forEach((player: RunDataPlayer) => {
                                    if (i === playerIndex) {
                                        teamId = player.teamID
                                    } else {
                                        otherTeamIds.push(player.teamID)
                                    }
                                    i++
                                })
                            })
                            if (teamId) {
                                let i = 1
                                setTimeout(function () {
                                    nodecg.sendMessageToBundle('timerStop', 'nodecg-speedcontrol', {
                                        id: teamId,
                                        forfeit: false,
                                    })
                                }, 1000 * i)
                                i++
                                otherTeamIds.forEach((team) => {
                                    setTimeout(function () {
                                        nodecg.sendMessageToBundle('timerStop', 'nodecg-speedcontrol', {
                                            id: team,
                                            forfeit: false,
                                        })
                                    }, 1000 * i)
                                    i++
                                })
                            }
                        }
                    }
                    if (this.invasionCtx !== null) {
                        this.invasionCtx.updateSides(this.boardRep.value.cells)
                        const clonedCells = clone(this.boardRep.value.cells)
                        this.invasionCtx.setMarkers(clonedCells)
                        this.boardRep.value.cells = clonedCells
                    }
                }

                if (json.type === 'chat') {
                    if (json.text === 'GO!') {
                        nodecg.sendMessageToBundle('timerStart', 'nodecg-speedcontrol')
                    }
                    if (json.text === 'pause') {
                        nodecg.sendMessageToBundle('timerPause', 'nodecg-speedcontrol')
                    }
                }
            }

            this.websocket.onclose = (event: { wasClean: boolean; code: number; reason: string; target: WebSocket }): void => {
                this.socketRep.value.status = 'disconnected'
                log.info(`Socket closed (code: ${event.code}, reason: ${event.reason})`)
                this.destroyWebsocket()
                this.createWebsocket(socketUrl, socketKey).catch((): void => {
                    // Intentionally discard errors raised here.
                    // They will have already been logged in the onmessage handler.
                })
            }
        })
    }

    private updateRowControlScore(cells: BingoboardCell[], color: BoardColor) {
        //count rows
        let rowCounter = 0
        for (let row = 0; row < 5; row++) {
            let goalsInRow = 0
            for (let column = 0; column < 5; column++) {
                if (cells[row * 5 + column].colors.includes(color)) {
                    goalsInRow++
                }
            }
            if (goalsInRow >= 3) {
                rowCounter++
            }
        }
        this.boardRep.value.colorCounts[color] = rowCounter
    }

    private updateJsrfLockoutScore(cells: BingoboardCell[], color: BoardColor) {
        let score = 0
        const BINGOSCORE = 3
        const GRAFFITISCORE = 3
        const SQUARESCORE = 1
        for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
            if (cells[cellIndex].colors.includes(color)) {
                if (cells[cellIndex].name.toLowerCase().includes('graffiti')) {
                    score += GRAFFITISCORE
                } else {
                    score += SQUARESCORE
                }
            }
        }
        for (let rowCol = 0; rowCol < 5; rowCol++) {
            // Row Bingo Checks
            if (
                cells[rowCol * 5].colors.includes(color) &&
                cells[rowCol * 5 + 1].colors.includes(color) &&
                cells[rowCol * 5 + 2].colors.includes(color) &&
                cells[rowCol * 5 + 3].colors.includes(color) &&
                cells[rowCol * 5 + 4].colors.includes(color)
            ) {
                score += BINGOSCORE
            }
            // Col Bingo Checks
            if (
                cells[rowCol].colors.includes(color) &&
                cells[5 + rowCol].colors.includes(color) &&
                cells[10 + rowCol].colors.includes(color) &&
                cells[15 + rowCol].colors.includes(color) &&
                cells[20 + rowCol].colors.includes(color)
            ) {
                score += BINGOSCORE
            }
        }
        //Diagonal Checks done by direct index reference
        if (
            cells[0].colors.includes(color) &&
            cells[6].colors.includes(color) &&
            cells[12].colors.includes(color) &&
            cells[18].colors.includes(color) &&
            cells[24].colors.includes(color)
        ) {
            score += BINGOSCORE
        }
        if (
            cells[4].colors.includes(color) &&
            cells[8].colors.includes(color) &&
            cells[12].colors.includes(color) &&
            cells[16].colors.includes(color) &&
            cells[20].colors.includes(color)
        ) {
            score += BINGOSCORE
        }
        this.boardRep.value.colorCounts[color] = score
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private countScore(json: any) {
        const boardModeRep = nodecg.Replicant<BingoboardMode>('bingoboardMode')
        if (boardModeRep.value.boardMode === 'rowcontrol') {
            this.updateRowControlScore(this.boardRep.value.cells, json.color)
        } else if (runData.value?.customData.Bingotype === 'jsrflockout') {
            this.updateJsrfLockoutScore(this.boardRep.value.cells, json.color)
        } else {
            console.log('normal count :(')
            //normal count
            if (json.remove) {
                this.boardRep.value.colorCounts[json.color] -= 1
            } else {
                this.boardRep.value.colorCounts[json.color] += 1
            }
        }
    }

    public destroyWebsocket(): void {
        if (!this.websocket) {
            return
        }

        try {
            this.websocket.onopen = noop
            this.websocket.onmessage = noop
            this.websocket.onclose = noop
            this.websocket.close()
        } catch (_error) {
            // tslint:disable-line:no-unused
            // Intentionally discard error.
        }

        this.websocket = null
    }
}

// create different bingosync instances
const bingosyncInstances: Map<string, BingosyncManager> = new Map()
const mainBoardRep = nodecg.Replicant<Bingoboard>('bingoboard')
const mainSocketRep = nodecg.Replicant<BingosyncSocket>('bingosyncSocket')
const mainBingoboardMode = nodecg.Replicant<BingoboardMode>('bingoboardMode')
const hostingBoardRep = nodecg.Replicant<Bingoboard>('hostingBingoboard')
const hostingSocketRep = nodecg.Replicant<BingosyncSocket>('hostingBingosocket')

bingosyncInstances.set('bingoboard', new BingosyncManager('bingoboard', mainBoardRep, mainSocketRep, mainBingoboardMode))
bingosyncInstances.set('hostingBingoboard', new BingosyncManager('hostingBingoboard', hostingBoardRep, hostingSocketRep, null)) // TODO hosting bingo bingoboard mode

// listeners for messages to interact from the dashboard

nodecg.listenFor('bingosync:joinRoom', async (data, callback): Promise<void> => {
    const manager = bingosyncInstances.get(data.name)
    try {
        if (!manager) {
            if (callback && !callback.handled) {
                callback(new Error(`No Bingosync Manager with name ${data.name} found`))
            }
        } else {
            await manager.joinRoomUrlOrCode(data.roomCode, data.passphrase)
            log.info(`Successfully joined room ${data.roomCode}.`)
            if (callback && !callback.handled) {
                callback(null)
            }
        }
    } catch (error) {
        if (manager) {
            manager.socketRep.value.status = 'error'
        }
        log.error(`Failed to join room ${data.roomCode}:`, error)
        if (callback && !callback.handled) {
            callback(error)
        }
    }
})

nodecg.listenFor('bingosync:leaveRoom', async (data, callback): Promise<void> => {
    const manager = bingosyncInstances.get(data.name)
    try {
        if (!manager) {
            if (callback && !callback.handled) {
                callback(new Error(`No Bingosync Manager with name ${data.name} found`))
            }
        } else {
            await manager.leaveRoom()
            log.info('Left room')
            if (callback && !callback.handled) {
                callback(null)
            }
        }
    } catch (error) {
        log.error('Failed to leave room:', error)
        if (callback && !callback.handled) {
            callback(error)
        }
    }
})

nodecg.listenFor('bingosync:toggleCard', (_data, callback): void => {
    try {
        boardMetaRep.value.boardHidden = !boardMetaRep.value.boardHidden
        if (callback && !callback.handled) {
            callback(null)
        }
    } catch (error) {
        if (callback && !callback.handled) {
            callback(error)
        }
    }
})

nodecg.listenFor('bingosync:toggleColors', (_data, callback): void => {
    try {
        boardMetaRep.value.colorShown = !boardMetaRep.value.colorShown
        if (callback && !callback.handled) {
            callback(null)
        }
    } catch (error) {
        if (callback && !callback.handled) {
            callback(error)
        }
    }
})

nodecg.listenFor(
    'bingosync:setPlayerColor',
    (
        data: {
            idx: number
            color: 'pink' | 'red' | 'orange' | 'brown' | 'yellow' | 'green' | 'teal' | 'blue' | 'navy' | 'purple'
        },
        callback,
    ): void => {
        boardMetaRep.value.playerColors[data.idx] = data.color
        if (callback && !callback.handled) {
            callback()
        }
    },
)

nodecg.listenFor('bingomode:setBingoboardMode', (data: BingoboardMode, callback): void => {
    if (data.boardMode === 'invasion') {
        data.markerRedirects = []
    }
    mainBingoboardMode.value = data
    if (callback && !callback.handled) {
        callback()
    }
})

nodecg.listenFor('bingomode:forceRefreshInvasion', (_data: unknown, callback): void => {
    bingosyncInstances.get('bingoboard')?.forceRefreshInvasionCtx()
    if (callback && !callback.handled) {
        callback()
    }
})
