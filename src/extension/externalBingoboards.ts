import { ExternalBingoboard, ExternalBingoboardMeta } from '../../schemas'
import { Ori1ExternalBingoboard } from './external-bingoboards/ori1BingoBoard'
import { Ori2ExternalBingoboard } from './external-bingoboards/ori2BingoBoard'

import * as nodecgApiContext from './util/nodecg-api-context'

const nodecg = nodecgApiContext.get()
const log = new nodecg.Logger(`${nodecg.bundleName}:externalBingo`);

export interface ExternalBingoboardManager {
    configure(meta: ExternalBingoboardMeta): Promise<void>,
    deactivate(): Promise<void>,
}

const boardRep = nodecg.Replicant<ExternalBingoboard>('externalBingoboard');
const externalBingoboardMetaRep = nodecg.Replicant<ExternalBingoboardMeta>('externalBingoboardMeta');

if (boardRep.value.cells.length === 0) {
    for (let i = 0; i < 25; i += 1) {
        boardRep.value.cells.push({name: '', hidden: true, hiddenName: '', colors: 'blank', slot: `slot${i}`});
    }
}

const externalBingoboards: {[key: string]: ExternalBingoboardManager} = {
    'ori1': new Ori1ExternalBingoboard(boardRep),
    'ori2': new Ori2ExternalBingoboard(boardRep),
}

let activeExternalBingoboard: ExternalBingoboardManager | undefined;

// recover
externalBingoboardMetaRep.once("change", value  => {
    if (value.game !== 'none') {
        const manager = externalBingoboards[value.game];
        if (!manager) {
            log.error(`external bingoboard doesn't have manager ${value.game}`);
        } else {
            activeExternalBingoboard = manager;
            manager.configure(value).catch(e => {
                log.error("error initially configuring external bingoboard:", value, e);
            });
        }
    }
    // used both for activating and deactivating
    nodecg.listenFor('externalBingoboard:configure', async (data: ExternalBingoboardMeta, callback): Promise<void> => {
        // store to recover from crash
        externalBingoboardMetaRep.value = data;
        if (data.game == "none") {
            activeExternalBingoboard?.deactivate().catch(e => {
                log.error("error deactivating external bingoboard:", e);
            });
            activeExternalBingoboard = undefined;
            if (callback && !callback.handled) {
                callback(null);
            }
        } else {
            const manager = externalBingoboards[data.game];
            try {
                if (manager !== activeExternalBingoboard) {
                    // if the manager changed, deactivate the old one
                    activeExternalBingoboard?.deactivate().catch(e => {
                        log.error("error deactivating external bingoboard:", e);
                    });
                    activeExternalBingoboard = undefined;
                }
                if (!manager) {
                    if (callback && !callback.handled) {
                        callback(new Error(`No external bingoboard manager with name ${data.game} found`));
                    }
                } else {
                    // update the new external bingoboard
                    activeExternalBingoboard = manager;
                    await manager.configure(data);
                    if (callback && !callback.handled) {
                        callback(null);
                    }
                }
            } catch (error) {
                log.error(`Failed to configure external bingoboard:`, data, error);
                if (callback && !callback.handled) {
                    callback(error);
                }
            }
        }
    });
});
