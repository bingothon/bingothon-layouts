'use-strict';

import * as tmi from 'tmi.js';
// eslint-disable-next-line import/no-extraneous-dependencies
import bingoDefinitions from './bingodefinitions';
import { RunDataActiveRun, RunDataPlayer, TwitchAPIData } from '../../speedcontrol-types';
import { TwitchChatBotData } from "../../schemas";
import { Configschema } from '../../configschema';

import * as nodecgApiContext from './util/nodecg-api-context';
import { waitForReplicants } from "./util/waitForReplicants";
import { TwitchChatBotCommand } from '../../types';

const nodecg = nodecgApiContext.get();
const log = new nodecg.Logger(`${nodecg.bundleName}:twitch-chat-bot`);

// there is probably a npm package with only that function
const asyncSleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// Map<str, {response:bla, enabled:true, cooldown:0, lastUsed:123456}>
// var chatCommandsRep = nodecg.Replicant('chatCommands', {defaultValue: {}});

// keep track of cooldowns
const cooldowns = {
    runner: { lastUsed: 0, cooldown: 15 },
    bingo: { lastUsed: 0, cooldown: 15 },
    schedule: {lastUsed: 0, cooldown: 15}};
// in case the cooldowns need to be adjusted
/* nodecg.listenFor('setCommandCooldown',data=>{
    if (!data || !data.command || !data.cooldown) {
        log.error("can't set cooldown if command and/or cooldown are missing, got:",data);
    } else {
        var com = cooldowns[data.command];
        if (com) {
            com.cooldown = data.cooldown;
        }
    }
}) */

// Setting up replicants.
const twichAPIDataRep = nodecg.Replicant<TwitchAPIData>('twitchAPIData', 'nodecg-speedcontrol');
const runDataActiveRunRep = nodecg.Replicant<RunDataActiveRun>('runDataActiveRun', 'nodecg-speedcontrol');
const twitchChatBotDataRep = nodecg.Replicant<TwitchChatBotData>('twitchChatBotData', 'bingothon-layouts');
twitchChatBotDataRep.value.state = 'disconnected';

const bundleConfig = nodecg.bundleConfig as Configschema;

function getTwitchAccessToken(): string {
  return twichAPIDataRep.value.accessToken || '';
}

function waitForEverythingReady(): Promise<void> {
  return new Promise((resolve, _) => {
    waitForReplicants([twichAPIDataRep, runDataActiveRunRep], () => {
      twichAPIDataRep.on('change', val => {
        if (val.state == 'on') {
          resolve();
        }
      })
    });
  });
}

function addCommand(command: TwitchChatBotCommand) {
  // make sure the name doesn't exist for this commandList
  if (!twitchChatBotDataRep.value.commands.every(com => com.commandList !== command.commandList || com.name !== command.name)) {
    throw new Error(`command ${command.name} already exists in list ${command.commandList}`);
  }
  twitchChatBotDataRep.value.commands.push(command);
}

function updateCommand(command: TwitchChatBotCommand) {
  const commandInDb = twitchChatBotDataRep.value.commands.find(c => c.name === command.name && c.commandList === command.commandList);
  if (commandInDb === undefined) {
    throw new Error(`command ${command.name} doesn't exist in list ${command.commandList}`);
  }
  commandInDb.cooldown = command.cooldown;
  commandInDb.enabled = command.enabled;
  commandInDb.text = command.text;
}

function renameCommand(oldName: string, oldCommandList: string, newName: string, newCommandList: string){
  const commandInDb = twitchChatBotDataRep.value.commands.find(c => c.name === oldName && c.commandList === oldCommandList);
  if (commandInDb === undefined) {
    throw new Error(`command ${oldName} doesn't exist in list ${oldCommandList}`);
  }
  if (!twitchChatBotDataRep.value.commands.every(com => com.commandList !== newCommandList || com.name !== newName)) {
    throw new Error(`command ${newName} already exists in list ${newCommandList}`);
  }
  commandInDb.name = newName;
  commandInDb.commandList = newCommandList;
}

nodecg.listenFor('twitchChatBot:addCommand', (message: TwitchChatBotCommand, cb) => {
  try {
    addCommand(message);
    if (cb && !cb.handled) {
      cb();
    }
  } catch(e) {
    if (cb && !cb.handled) {
      cb(e);
    }
  }
});

nodecg.listenFor('twitchChatBot:updateCommand', (message: TwitchChatBotCommand, cb) => {
  try {
    updateCommand(message);
    if (cb && !cb.handled) {
      cb();
    }
  } catch(e) {
    if (cb && !cb.handled) {
      cb(e);
    }
  }
});

nodecg.listenFor('twitchChatBot:renameCommand', (message: {oldName: string, oldCommandList: string, newName: string, newCommandList: string}, cb) => {
  try {
    renameCommand(message.oldName, message.oldCommandList, message.newName, message.newCommandList);
    if (cb && !cb.handled) {
      cb();
    }
  } catch(e) {
    if (cb && !cb.handled) {
      cb(e);
    }
  }
});

const MAX_CONNECT_RETRIES = 10;
class TwitchBotWrapper {
  client: tmi.Client;
  currentChannel: string | null = null;
  constructor() {
    const options = {
      options: {
        // debug: true,  // might want to turn off when in production
      },
      connection: {
        secure: true,
        reconnect: true,
      },
      identity: {
        username: twichAPIDataRep.value.channelName || '',
        password: getTwitchAccessToken,
      },
    };

    this.client = tmi.Client(options);
    this.client.on('message', this.messageHandler.bind(this));
    this.connect();

    twichAPIDataRep.on('change', (newTwitchApiData, oldTwitchApiData) => {
      if (!oldTwitchApiData) return;
      // switch twitch integration on
      if (newTwitchApiData.state === 'on' && oldTwitchApiData.state !== 'on') {
        this.connect();
      }
      // switch twitch integration off
      if (newTwitchApiData.state === 'off' && oldTwitchApiData.state !== 'off') {
        this.disconnect();
      }
    });

    nodecg.listenFor('twitchChatBot:reconnect', async (_msg, cb) => {
      try {
        await this.reconnect();
        if (cb && !cb.handled) {
          cb();
        }
      } catch(e) {
        if (cb && !cb.handled) {
          cb(e);
        }
      }
    });
  }

  messageHandler(channel: string, user: tmi.ChatUserstate, message: string, self: boolean): void {
    // only listen to commands in chat
    if (self) return;
    if (user['message-type'] !== 'chat') return;
    if (!message.startsWith('!')) return;
    const parts = message.split(' ', 3);
    const userCommandName = parts[0].slice(1);
    const now = new Date().getTime();
    if (userCommandName === 'runner' || userCommandName === 'runners' || userCommandName === 'r') {
      // check cooldown to not spam chat
      if (now - cooldowns.runner.lastUsed < cooldowns.runner.cooldown) {
        return;
      }
      cooldowns.runner.lastUsed = now;
      // Grab current runners and format them & their twitch
      // should never happen
      if (!runDataActiveRunRep.value) {
        return;
      }
      // rip flatMap
      let players: RunDataPlayer[] = [];
      // eslint-disable-next-line
      runDataActiveRunRep.value.teams.forEach(t => players = players.concat(t.players));
      const runersStr = players.map((p, idx): string => `Player ${idx + 1}: ${p.name} ( twitch.tv/${p.social.twitch} )`).join('. ');
      if (runersStr) {
        this.client.say(channel, `Follow the runners! ${runersStr}`)
          .catch((e): void => log.error('', e));
      }
      return;
    }
    if (userCommandName === 'bingo') {
      // check cooldown to not spam chat
      if (now - cooldowns.bingo.lastUsed < cooldowns.bingo.cooldown) {
        return;
      }
      cooldowns.bingo.lastUsed = now;
      if (runDataActiveRunRep.value && runDataActiveRunRep.value.customData) {
        const bingotype = runDataActiveRunRep.value.customData.Bingotype;
        if (bingotype) {
          const isCoop = runDataActiveRunRep.value.teams[0].players.length > 1;
          let explanation = bingoDefinitions[bingotype];
          if (explanation) {
            if (isCoop) {
              explanation += bingoDefinitions.coop;
            }
            this.client.say(channel, explanation)
              .catch((e): void => log.error('', e));
          }
        }
      }
    }

    if (userCommandName === 'schedule' || userCommandName === 'upcoming') {
        // check cooldown to not spam chat
        if (now - cooldowns.schedule.lastUsed < cooldowns.schedule.cooldown) {
            return;
        }
        cooldowns.schedule.lastUsed = now;
        this.client.say(channel, "Find the schedule at https://horaro.org/bingothons21/schedule")
            .catch((e): void => log.error('', e));
    }
    const knownCommand = twitchChatBotDataRep.value.commands.find(command =>
      command.name === userCommandName
      && ['global'].includes(command.commandList));
    if (knownCommand !== undefined && knownCommand.enabled) {
      // check cooldown to not spam chat
      if (now - knownCommand.lastUsed < knownCommand.cooldown * 1000) {
          return;
      }
      this.client.say(channel, knownCommand.text)
        .catch((e): void => log.error('', e));
    }
  }
  
  async disconnect(): Promise<void> {
    await this.client.disconnect();
    twitchChatBotDataRep.value.state = 'disconnected';
  }

  async connect(): Promise<void> {
    if (['disconnected', 'error'].includes(twitchChatBotDataRep.value.state)) {
      // check if the twitch access token should still be valid
      const tokenExpiresAt = twichAPIDataRep.value.tokenExpiresAt;
      if (tokenExpiresAt !== undefined) {
        if (tokenExpiresAt - 10 * 1000 < Date.now()) {
          log.info("twitch api token is NOT up to date, sending refresh request...");
          nodecg.sendMessageToBundle("twitchRefreshAccessToken", "nodecg-speedcontrol");
          await asyncSleep(1000);
        } else {
          log.info("twitch api token is up to date");
        }
      } else {
        log.warn("tokenExpiresAt is undefined, speedcontrol is probably not up to date! Trying to refresh token anyway");
        nodecg.sendMessageToBundle("twitchRefreshAccessToken", "nodecg-speedcontrol");
      }
      twitchChatBotDataRep.value.state = 'connecting';
      for (let i = 0;i<MAX_CONNECT_RETRIES;i++) {
        try {
          await this.client.connect();
          log.info('successfully connected');
          break;
        } catch(e) {
          nodecg.sendMessageToBundle("twitchRefreshAccessToken", "nodecg-speedcontrol");
          log.error(`connection Error on try ${i}:`, e);
        }
      }
      twitchChatBotDataRep.value.state = 'connected';
      this.switchChannel(twichAPIDataRep.value.channelName || 'bingothon');
    }
  }

  async reconnect(): Promise<void> {
    await this.disconnect();
    await this.connect();
  }

  async switchChannel(newChannel: string): Promise<void> {
    if (this.currentChannel !== null) {
      await this.client.part(this.currentChannel);
      this.currentChannel = null;
    }
    await this.client.join(newChannel);
    this.currentChannel = newChannel;
    nodecg.log.info('channels:', this.client.getChannels());
  }
}

if (bundleConfig.twitch && bundleConfig.twitch.enable && bundleConfig.twitch.chatBot) {
  waitForEverythingReady().then((): void => {
    log.info('Twitch chat bot is enabled.');

    const bot = new TwitchBotWrapper();

    setTimeout(() => {
      nodecg.sendMessageToBundle("twitchGetAccessToken", "nodecg-speedcontrol", null, (err, args) => {
        log.info("got new access token!");
        log.info(err);
        log.info(args);
      })
    }, 10 * 1000);

    // nodecg.listenFor("repeaterFeaturedChannels", "nodecg-speedcontrol", (channels: string[]) => {
    //   if (twichAPIDataRep.value.channelName) {
    //     client.say(twichAPIDataRep.value.channelName, `!ffzfollow ${channels.join(', ')}`);
    //   }
    // });

  });
}
