'use-strict';

import * as tmi from 'tmi.js';
// eslint-disable-next-line import/no-extraneous-dependencies
import bingoDefinitions from './bingodefinitions';
import { RunDataActiveRun, RunDataPlayer, TwitchAPIData } from '../../speedcontrol-types';
import { Configschema } from '../../configschema';

import * as nodecgApiContext from './util/nodecg-api-context';
import { waitForReplicants } from "./util/waitForReplicants";

const nodecg = nodecgApiContext.get();
const log = new nodecg.Logger(`${nodecg.bundleName}:twitch-chat-bot`);

// Map<str, {response:bla, enabled:true, cooldown:0, lastUsed:123456}>
// var chatCommandsRep = nodecg.Replicant('chatCommands', {defaultValue: {}});

// keep track of cooldowns
const cooldowns = { runner: { lastUsed: 0, cooldown: 15 }, bingo: { lastUsed: 0, cooldown: 15 } };
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
const bundleConfig = nodecg.bundleConfig as Configschema;

if (bundleConfig.twitch && bundleConfig.twitch.enable && bundleConfig.twitch.chatBot) {
  waitForReplicants([twichAPIDataRep, runDataActiveRunRep], (): void => {
    log.info('Twitch chat bot is enabled.');

    nodecg.listenFor("repeaterFeaturedChannels", "nodecg-speedcontrol", (channels: string[]) => {
      if (twichAPIDataRep.value.channelName) {
        client.say(twichAPIDataRep.value.channelName, `!ffzfollow ${channels.join(', ')}`);
      }
    });

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
        password: twichAPIDataRep.value.accessToken,
      },
    };

    const client = tmi.Client(options);

    // message handler function
    function messageHandler(channel: string, user: {[key: string]: string},
      message: string, self: boolean): void {
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
          client.say(channel, `Follow the runners! ${runersStr}`)
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
              client.say(channel, explanation)
                .catch((e): void => log.error('', e));
            }
          }
        }
      }
      /* also custom chatbot stuff not used
          if (chatCommandsRep.value.hasOwnProperty(userCommandName)) {
              var userCommand = chatCommandsRep.value[userCommandName];
              if (userCommand &&
                  userCommand.enabled &&
                  (new Date().getTime() - userCommand.lastUsed) > userCommand.cooldown) {
                      client.say(channel, userCommand.response);
                      userCommand.lastUsed = new Date().getTime();
              }
          } */
    }
    client.connect()
      .catch((e): void => log.error('', e))
      .then((): void => {
        client.on('message', messageHandler);
        client.join(twichAPIDataRep.value.channelName || 'speedrunslive')
          .catch((reason): void => {
            log.error(`Couldn't join channel: ${reason}`);
          }).then((data): void => {
            log.info(`Joined channel: ${data}`);
          });
      });
  });
}
