"use strict";
/* eslint-disable @typescript-eslint/no-use-before-define */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mpc_js_1 = require("mpc-js");
const nodecgApiContext = __importStar(require("./util/nodecg-api-context"));
const nodecg = nodecgApiContext.get();
const logger = new nodecg.Logger(`${nodecg.bundleName}:mpd`);
const mpdConfig = nodecg.bundleConfig.mpd || {};
// const volume = mpdConfig.volume || 80;
// const currentVolume: number = volume;
// let fadeInterval: NodeJS.Timeout;
let shuffleInterval;
let connected = false;
// Stores song data to be displayed on layouts.
const songData = nodecg.Replicant('songData', { persistent: false });
// Set up connection to MPD server.
const client = new mpc_js_1.MPC();
connect();
function connect() {
    client.connectTCP(mpdConfig.address || 'localhost', mpdConfig.port || 6600);
    // Set up events.
    client.on('ready', onReady);
    client.on('socket-end', onEnd);
    client.on('socket-error ', onError);
    client.on('changed-player', onSystemPlayer);
}
// Listen for NodeCG messages from dashboard/layouts.
nodecg.listenFor('pausePlaySong', () => {
    if (!connected)
        return;
    if (songData.value.playing) {
        client.playback.stop();
    }
    else {
        client.playback.play();
    }
});
nodecg.listenFor('skipSong', skipSong);
function onReady() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            connected = true;
            const playList = yield client.currentPlaylist.playlistInfo();
            if (playList.length <= 0) {
                logger.info('Doing initial MPD configuration.');
                yield client.currentPlaylist.add('/');
                yield client.playbackOptions.setRepeat(true);
                yield shufflePlaylist();
                yield client.playback.play();
            }
            // Always set volume on connection just in case, but we need to wait a
            // little for some reason (probably for playback to commence).
            // setTimeout(setVolume, 2000);
            // Shuffle the playlist every 6 hours.
            // (We're only playing music in intermissions; doesn't need to be frequent).
            clearInterval(shuffleInterval);
            shuffleInterval = setInterval(shufflePlaylist, 21600000);
            yield updatePlaybackStatusAndSong();
        }
        catch (e) {
            logger.error('', e);
        }
    });
}
function onEnd() {
    connected = false;
    logger.warn('MPD connection lost, retrying in 5 seconds.');
    setTimeout(connect, 5000);
}
function onError(err) {
    logger.warn('MPD connection error.', err);
    logger.debug('MPD connection error:', err);
}
// Update stuff when the player status changes.
function onSystemPlayer() {
    return __awaiter(this, void 0, void 0, function* () {
        yield updatePlaybackStatusAndSong();
    });
}
// Used to update the replicant to say if there is a song playing or not
// also updates the title
function updatePlaybackStatusAndSong() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const status = yield client.status.status();
            if (status.state !== 'play') {
                songData.value.playing = false;
                songData.value.title = 'No Track Playing';
            }
            else {
                songData.value.playing = true;
                const currentSong = yield client.status.currentSong();
                const songTitle = `${currentSong.title} - ${currentSong.artist}`;
                if (songTitle !== songData.value.title) {
                    songData.value.title = songTitle;
                }
            }
        }
        catch (e) {
            logger.error('', e);
        }
    });
}
// Can be used to skip to the next song.
function skipSong() {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.playback.next()
            .catch((e) => logger.error('', e));
    });
}
// Used to shuffle the currently playing list *correctly*.
// Actual shuffle is the same *every time* so let's add some randomness here!
function shufflePlaylist() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const random = Math.floor(Math.random() * Math.floor(20));
            for (let i = 0; i < random; i += 1) {
                // eslint-disable-next-line no-await-in-loop
                yield client.currentPlaylist.shuffle();
            }
        }
        catch (e) {
            logger.error('', e);
        }
    });
}
/* fade not used since we used http based music streaming
which doesn't support volume apparently
// Used to set the player volume to whatever the variable is set to.
async function setVolume(): Promise<void> {
  await client.playbackOptions.setVolume(currentVolume)
    .catch((e): void => logger.error('', e));
}

// Used to fade out and pause the song.
async function fadeOut(): Promise<void> {
  if (!connected) return;

  clearInterval(fadeInterval);
  currentVolume = volume;
  await setVolume();

  async function loop(): Promise<void> {
    currentVolume -= 1;
    await setVolume();
    if (currentVolume <= 0) {
      clearInterval(fadeInterval);
      client.playback.pause(true)
        .catch((e): void => logger.error('', e));
    }
  }

  fadeInterval = setInterval(loop, 200);
}

// Used to unpause and fade in the song.
async function fadeIn(): Promise<void> {
  if (!connected) return;

  clearInterval(fadeInterval);
  currentVolume = 0;
  await client.playback.pause(false)
    .catch((e): void => logger.error('', e));
  await setVolume();

  async function loop(): Promise<void> {
    currentVolume += 1;
    await setVolume();
    if (currentVolume >= volume) {
      clearInterval(fadeInterval);
    }
  }

  fadeInterval = setInterval(loop, 200);
} */
