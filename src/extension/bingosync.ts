

// Based on https://github.com/GamesDoneQuick/sgdq18-layouts/blob/master/src/extension/oot-bingo.ts
// Packages
import * as RequestPromise from 'request-promise';
import WebSocket from 'ws';

// Ours
import { Replicant } from 'nodecg/types/server'; // eslint-disable-line import/no-extraneous-dependencies
import * as nodecgApiContext from './util/nodecg-api-context';
import { BingoboardMeta, Bingoboard, BingosyncSocket, BingoboardMode } from '../../schemas';

import equal from 'deep-equal';

const nodecg = nodecgApiContext.get();
const log = new nodecg.Logger(`${nodecg.bundleName}:bingosync`);
const boardMetaRep = nodecg.Replicant<BingoboardMeta>('bingoboardMeta');
const bingoboardMode = nodecg.Replicant<BingoboardMode>('bingoboardMode');

const noop = (): void => {}; // tslint:disable-line:no-empty
const bingosyncSocketUrl = 'wss://sockets.bingosync.com';
const bingosyncSiteUrl = 'https://bingosync.com';

// recover().catch((error) => {
//  log.error(`Failed to recover connection to room ${socketRep.value.roomCode}:`, error);
// });

function processCellForMarkers(cell: {colors: string, markers: any}) {
  if (cell.colors === 'blank') return;
  const newColors: string[] = [];
  const markers: (string | null)[] = [null,null,null,null];
  // each color could be overritten by a marker
  cell.colors.split(' ').forEach((color): void => {
    let redirected = false;
    for(const [i,redirect] of bingoboardMode.value.markerRedirects.entries()) {
      if (color === redirect[0]) {
        markers[i] = redirect[1];
        redirected = true;
      }
    }
    if (!redirected) {
      newColors.push(color);
    }
  });
  // if a cell has both a marker and is filled with the same color, drop the marker
  markers.forEach((color, index) => {
    if (color !== null && newColors.includes(color)) {
      markers[index] = null;
    }
  });
  cell.colors = newColors.join(' ');
  cell.markers = markers;
}

class BingosyncManager {
  public name: string;

  public boardRep: Replicant<Bingoboard>;

  public socketRep: Replicant<BingosyncSocket>;

  private request = RequestPromise.defaults({ jar: true });

  // <= Automatically saves and re-uses cookies.
  // interval for a complete update to not miss stuff
  private fullUpdateInterval: NodeJS.Timer | undefined;

  // interval the fullUpdate function uses to make sure
  // there wasn't an event that cancels the interval
  private tempFullUpdateInterval: NodeJS.Timer | undefined;

  private websocket: WebSocket | null = null;

  public constructor(name: string, boardRep: Replicant<Bingoboard>,
    socketRep: Replicant<BingosyncSocket>) {
    this.name = name;
    this.boardRep = boardRep;
    this.socketRep = socketRep;
    // recovering past connection
    // catch startup errors when this is all empty
    if (!this.socketRep.value
      || !this.socketRep.value.roomCode
      || !this.socketRep.value.passphrase) {
      if (!this.socketRep.value) {
        this.socketRep.value = { status: 'disconnected' };
        return;
      }
      this.socketRep.value.status = 'disconnected';
    }
    // Restore previous connection on startup
    const { roomCode, passphrase } = this.socketRep.value;
    if (roomCode && passphrase) {
      log.info(`Recovering connection to room ${this.socketRep.value.roomCode}`);
      this.joinRoom(roomCode, passphrase)
        .then((): void => {
          log.info(`Successfully recovered connection to room ${this.socketRep.value.roomCode}`);
        })
        .catch((e): void => {
          this.socketRep.value.status = 'error';
          log.error(`Couldn't join room ${this.socketRep.value.roomCode}`, e);
        });
    }
  }

  public async joinRoom(roomCode: string, passphrase: string): Promise<void> {
    this.socketRep.value.passphrase = passphrase;
    this.socketRep.value.roomCode = roomCode;
    this.socketRep.value.status = 'connecting';
    if (this.fullUpdateInterval) {
      clearInterval(this.fullUpdateInterval);
    }
    this.destroyWebsocket();

    log.info('Fetching bingosync socket key...');
    const data = await this.request.post({
      uri: `${bingosyncSiteUrl}/api/join-room`,
      followAllRedirects: true,
      json: {
        room: roomCode,
        nickname: 'bingothon',
        password: passphrase,
      },
    });

    const socketKey = data.socket_key;
    log.info('Got bingosync socket key!');

    const thisInterval = setInterval((): void => {
      this.fullUpdate(roomCode).catch((error): void => {
        log.error('Failed to fullUpdate:', error);
      });
    }, 60 * 1000);
    this.fullUpdateInterval = thisInterval;
    this.tempFullUpdateInterval = thisInterval;

    await this.fullUpdate(roomCode);
    await this.createWebsocket(bingosyncSocketUrl, socketKey);
  }

  public async leaveRoom(): Promise<void> {
    if (this.fullUpdateInterval) {
      clearInterval(this.fullUpdateInterval);
    }
    this.destroyWebsocket();
    this.socketRep.value.status = 'disconnected';
    this.socketRep.value.passphrase = '';
    this.socketRep.value.roomCode = '';
  }

  public async fullUpdate(roomCode: string): Promise<void> {
    const newBoardState = await this.request.get({
      uri: `${bingosyncSiteUrl}/room/${roomCode}/board`,
      json: true,
    });

    // Bail if the room changed while this request was in-flight.
    if (this.fullUpdateInterval !== this.tempFullUpdateInterval) {
      return;
    }

    // make sure doubleclicks don't screw the number
    const goalCounts: {[key: string]: number} = {
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
    };

    newBoardState.forEach((cell: {colors: string, markers: any}): void => {
      // remove blank cause thats not a color
      // count all the color occurences
      cell.colors.split(' ').forEach((color): void => {
        if (color !== 'blank') {
          goalCounts[color] += 1;
        }
      });
      processCellForMarkers(cell);
    });

    this.boardRep.value.colorCounts = goalCounts;

    // Bail if nothing has changed.
    if (equal(this.boardRep.value.cells, newBoardState)) {
      return;
    }


    this.boardRep.value.cells = newBoardState;
  }

  public async createWebsocket(socketUrl: string, socketKey: string): Promise<void> {
    return new Promise((resolve, reject): void => {
      let settled = false;

      log.info('Opening socket...');
      this.socketRep.value.status = 'connecting';
      this.websocket = new WebSocket(`${socketUrl}/broadcast`);

      this.websocket.onopen = (): void => {
        log.info('Socket opened.');
        if (this.websocket) {
          // eslint-disable-next-line @typescript-eslint/camelcase
          this.websocket.send(JSON.stringify({ socket_key: socketKey }));
        }
      };

      this.websocket.onmessage = (event: {
        data: WebSocket.Data; type: string; target: WebSocket;
      }): void => {
        let json;
        try {
          json = JSON.parse(event.data as string);
        } catch (error) { // tslint:disable-line:no-unused
          log.error('Failed to parse message:', event.data);
        }

        if (json.type === 'error') {
          if (this.fullUpdateInterval) {
            clearInterval(this.fullUpdateInterval);
          }
          this.destroyWebsocket();
          this.socketRep.value.status = 'error';
          log.error('Socket protocol error:', json.error ? json.error : json);
          if (!settled) {
            reject(new Error(json.error ? json.error : 'unknown error'));
            settled = true;
          }
          return;
        }

        if (!settled) {
          resolve();
          this.socketRep.value.status = 'connected';
          settled = true;
        }

        if (json.type === 'goal') {
          const index = parseInt(json.square.slot.slice(4), 10) - 1;
          const cell = json.square;
          processCellForMarkers(cell);
          this.boardRep.value.cells[index] = cell;
          // update goal count
          if (json.remove) {
            this.boardRep.value.colorCounts[cell.color] -= 1;
          } else {
            this.boardRep.value.colorCounts[cell.color] += 1;
          }
        }
      };

      this.websocket.onclose = (event: {
        wasClean: boolean; code: number; reason: string; target: WebSocket;
      }): void => {
        this.socketRep.value.status = 'disconnected';
        log.info(`Socket closed (code: ${event.code}, reason: ${event.reason})`);
        this.destroyWebsocket();
        this.createWebsocket(socketUrl, socketKey).catch((): void => {
          // Intentionally discard errors raised here.
          // They will have already been logged in the onmessage handler.
        });
      };
    });
  }

  public destroyWebsocket(): void {
    if (!this.websocket) {
      return;
    }

    try {
      this.websocket.onopen = noop;
      this.websocket.onmessage = noop;
      this.websocket.onclose = noop;
      this.websocket.close();
    } catch (_error) { // tslint:disable-line:no-unused
      // Intentionally discard error.
    }

    this.websocket = null;
  }
}

// create different bingosync instances
const bingosyncInstances: Map<string, BingosyncManager> = new Map();
const mainBoardRep = nodecg.Replicant<Bingoboard>('bingoboard');
const mainSocketRep = nodecg.Replicant<BingosyncSocket>('bingosyncSocket');
const hostingBoardRep = nodecg.Replicant<Bingoboard>('hostingBingoboard');
const hostingSocketRep = nodecg.Replicant<BingosyncSocket>('hostingBingosocket');

bingosyncInstances.set('bingoboard', new BingosyncManager('bingoboard', mainBoardRep, mainSocketRep));
bingosyncInstances.set('hostingBingoboard', new BingosyncManager('hostingBingoboard', hostingBoardRep, hostingSocketRep));

// listeners for messages to interact from the dashboard

nodecg.listenFor('bingosync:joinRoom', async (data, callback): Promise<void> => {
  const manager = bingosyncInstances.get(data.name);
  try {
    if (!manager) {
      if (callback && !callback.handled) {
        callback(new Error(`No Bingosync Manager with name ${data.name} found`));
      }
    } else {
      await manager.joinRoom(
        data.roomCode,
        data.passphrase,
      );
      log.info(`Successfully joined room ${data.roomCode}.`);
      if (callback && !callback.handled) {
        callback(null);
      }
    }
  } catch (error) {
    if (manager) {
      manager.socketRep.value.status = 'error';
    }
    log.error(`Failed to join room ${data.roomCode}:`, error);
    if (callback && !callback.handled) {
      callback(error);
    }
  }
});

nodecg.listenFor('bingosync:leaveRoom', async (data, callback): Promise<void> => {
  const manager = bingosyncInstances.get(data.name);
  try {
    if (!manager) {
      if (callback && !callback.handled) {
        callback(new Error(`No Bingosync Manager with name ${data.name} found`));
      }
    } else {
      await manager.leaveRoom();
      log.info('Left room');
      if (callback && !callback.handled) {
        callback(null);
      }
    }
  } catch (error) {
    log.error('Failed to leave room:', error);
    if (callback && !callback.handled) {
      callback(error);
    }
  }
});

nodecg.listenFor('bingosync:toggleCard', (_data, callback): void => {
  try {
    boardMetaRep.value.boardHidden = !boardMetaRep.value.boardHidden;
    if (callback && !callback.handled) {
      callback(null);
    }
  } catch (error) {
    if (callback && !callback.handled) {
      callback(error);
    }
  }
});

nodecg.listenFor('bingosync:toggleColors', (_data, callback): void => {
  try {
    boardMetaRep.value.colorShown = !boardMetaRep.value.colorShown;
    if (callback && !callback.handled) {
      callback(null);
    }
  } catch (error) {
    if (callback && !callback.handled) {
      callback(error);
    }
  }
});

nodecg.listenFor('bingosync:setPlayerColor', (data: {
  idx: number;
  color: ('pink' | 'red' | 'orange' | 'brown' | 'yellow' | 'green' | 'teal' | 'blue' | 'navy' | 'purple');
}, callback): void => {
  boardMetaRep.value.playerColors[data.idx] = data.color;
  if (callback && !callback.handled) {
    callback();
  }
});
