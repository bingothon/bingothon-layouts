import * as RequestPromise from 'request-promise';

import { ExternalBingoboardManager } from '@/externalBingoboards';
import { boardMetaRep } from '@/util/replicants';
import type NodeCG from '@nodecg/types';
import { ExternalBingoboard } from 'schemas/externalBingoboard';
import { ExternalBingoboardMeta } from 'schemas/externalBingoboardMeta';
import * as nodecgApiContext from '../util/nodecg-api-context';

interface DeusExCell {
    x: number;
    y: number;
    name: string;
    completed: boolean;
    possible: boolean;
}

type DeusExResponse = DeusExCell[];

const nodecg = nodecgApiContext.get();
const log = new nodecg.Logger(`${nodecg.bundleName}:deusExBingo`);
const request = RequestPromise.defaults({ jar: true });

export class DeusExternalBingoboard implements ExternalBingoboardManager {
    updateLoopTimer?: NodeJS.Timeout;

    constructor(private boardRep: NodeCG.ServerReplicantWithSchemaDefault<ExternalBingoboard>) {}

    async configure(meta: ExternalBingoboardMeta): Promise<void> {
        if (meta.game !== 'deus-ex') {
            log.error('tried to configure deus-ex bingo but game is not deus-ex!');
            return;
        }

        await this.bingoUpdate();
        if (!this.updateLoopTimer) {
            this.updateLoopTimer = setInterval(() => {
                this.bingoUpdate().catch((e) => {
                    log.error('deus-ex update error:', e);
                });
            }, 3000);
        }
    }

    async bingoUpdate(): Promise<void> {
        try {
            // eslint-disable-next-line max-len
            // console.log('update')
            const response: DeusExResponse = await request.get('https://mods4ever.com/public/bingo.txt', { json: true });
            if (this.boardRep.value) {
                const playerColor = boardMetaRep.value.playerColors[0] || 'red';
                const colorCounts: { [key: string]: number } = {
                    pink: 0,
                    red: 0,
                    orange: 0,
                    brown: 0,
                    yellow: 0,
                    green: 0,
                    teal: 0,
                    blue: 0,
                    navy: 0,
                    purple: 0
                };
                const cells = response.map((cell, index) => {
                    if (cell.completed) {
                        colorCounts[playerColor]++;
                    }
                    return {
                        hidden: false,
                        hiddenName: cell.name,
                        name: cell.name,
                        slot: `slot${index}`,
                        colors: cell.completed ? [playerColor] : cell.possible ? [] : ['red']
                    };
                });
                this.boardRep.value.cells = cells;
                this.boardRep.value.colorCounts = colorCounts;
            } else {
                log.error('board rep unexpectedly undefined!');
            }
        } catch (e) {
            log.error(e);
        }
    }

    deactivate(): Promise<void> {
        if (this.updateLoopTimer) {
            clearInterval(this.updateLoopTimer);
            this.updateLoopTimer = undefined;
        }
        return Promise.resolve();
    }
}
