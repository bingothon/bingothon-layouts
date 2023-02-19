/* eslint-disable @typescript-eslint/no-use-before-define */

import {MPC, MPDError} from 'mpc-js'
import * as nodecgApiContext from './util/nodecg-api-context'
import {SongData} from '../../schemas'

const nodecg = nodecgApiContext.get()
const logger = new nodecg.Logger(`${nodecg.bundleName}:mpd`)
const mpdConfig = nodecg.bundleConfig.mpd || {}
// const volume = mpdConfig.volume || 80;
// const currentVolume: number = volume;
// let fadeInterval: NodeJS.Timeout;
let shuffleInterval: NodeJS.Timeout
let connected = false

// Stores song data to be displayed on layouts.
const songData = nodecg.Replicant<SongData>('songData', { persistent: false })

// Set up connection to MPD server.
const client = new MPC()
connect()
function connect(): void {
    client.connectTCP(mpdConfig.address || 'localhost', mpdConfig.port || 6600)

    // Set up events.
    client.on('ready', onReady)
    client.on('socket-end', onEnd)
    client.on('socket-error ', onError)
    client.on('changed-player', onSystemPlayer)
}

// Listen for NodeCG messages from dashboard/layouts.
nodecg.listenFor('pausePlaySong', (): void => {
    if (!connected) return
    if (songData.value.playing) {
        client.playback.stop()
    } else {
        client.playback.play()
    }
})
nodecg.listenFor('skipSong', skipSong)

async function onReady(): Promise<void> {
    try {
        connected = true
        const playList = await client.currentPlaylist.playlistInfo()
        if (playList.length <= 0) {
            logger.info('Doing initial MPD configuration.')
            await client.currentPlaylist.add('/')
            await client.playbackOptions.setRepeat(true)
            await shufflePlaylist()
            await client.playback.play()
        }
        // Always set volume on connection just in case, but we need to wait a
        // little for some reason (probably for playback to commence).
        // setTimeout(setVolume, 2000);

        // Shuffle the playlist every 6 hours.
        // (We're only playing music in intermissions; doesn't need to be frequent).
        clearInterval(shuffleInterval)
        shuffleInterval = setInterval(shufflePlaylist, 21600000)

        await updatePlaybackStatusAndSong()
    } catch (e) {
        logger.error('', e)
    }
}

function onEnd(): void {
    connected = false
    logger.warn('MPD connection lost, retrying in 5 seconds.')
    setTimeout(connect, 5000)
}

function onError(err: MPDError): void {
    logger.warn('MPD connection error.', err)
    logger.debug('MPD connection error:', err)
}

// Update stuff when the player status changes.
async function onSystemPlayer(): Promise<void> {
    await updatePlaybackStatusAndSong()
}

// Used to update the replicant to say if there is a song playing or not
// also updates the title
async function updatePlaybackStatusAndSong(): Promise<void> {
    try {
        const status = await client.status.status()
        if (status.state !== 'play') {
            songData.value.playing = false
            songData.value.title = 'No Track Playing'
        } else {
            songData.value.playing = true
            const currentSong = await client.status.currentSong()
            const songTitle = `${currentSong.title} - ${currentSong.artist}`
            if (songTitle !== songData.value.title) {
                songData.value.title = songTitle
            }
        }
    } catch (e) {
        logger.error('', e)
    }
}

// Can be used to skip to the next song.
async function skipSong(): Promise<void> {
    await client.playback.next().catch((e): void => logger.error('', e))
}

// Used to shuffle the currently playing list *correctly*.
// Actual shuffle is the same *every time* so let's add some randomness here!
async function shufflePlaylist(): Promise<void> {
    try {
        const random = Math.floor(Math.random() * Math.floor(20))
        for (let i = 0; i < random; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            await client.currentPlaylist.shuffle()
        }
    } catch (e) {
        logger.error('', e)
    }
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
