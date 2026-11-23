import { ExternalBingoboardManager } from '@/externalBingoboards';
import { ExternalBingoboardMeta } from 'schemas/externalBingoboardMeta';
import * as nodecgApiContext from '../util/nodecg-api-context';
import { Client, Item } from 'archipelago.js';
import NodeCG from '@nodecg/types';
import { ExternalBingoboard } from 'schemas/externalBingoboard';
import { BingoboardMeta } from 'schemas/bingoboardMeta';
import { boardMetaRep } from '@/util/replicants';
import { ExplorationBingoboardCell } from 'types';

const nodecg = nodecgApiContext.get();
const log = new nodecg.Logger(`${nodecg.bundleName}:archipelago`);

type HintData = {
    itemName: string;
    name: string;
    id: number;
    player: number;
};

type BingoSlotData = {
    requiredBingoCount: number;
    boardLocations: string[]; // Location description for each square
    boardSize: number;
    fogOfWar: boolean;
    startSquare: string;
    autoHints: boolean;
    hintData: HintData[];
    additionalBingos: string[];
    minigameMania?: boolean;
    deathLink?: boolean;
};

function mapReceivedItemName(itemName: string): string {
    const match = itemName.match(/^Free Square: ([A-Z]+\d+)$/);
    return match ? match[1] : itemName;
}

export class ArchipelagoBingoBoard implements ExternalBingoboardManager {
    client: Client;
    // internal board rep
    board: { locationName: string; checkHint: string; checkOwner: string; checked: boolean }[][] = [];
    metaBoardUpdateFunc: (meta: BingoboardMeta) => void;

    constructor(private boardRep: NodeCG.ServerReplicantWithSchemaDefault<ExternalBingoboard>) {
        this.client = new Client();
        this.metaBoardUpdateFunc = (meta: BingoboardMeta) => {
            let checked = 0;
            const playerColor = meta.playerColors[0] || 'red';
            const cells: ExplorationBingoboardCell[][] = this.board.map((row) =>
                row.map((cell) => {
                    if (cell.checked) checked++;
                    return {
                        name: cell.checkHint,
                        hidden: false,
                        hiddenName: cell.checkHint,
                        slot: cell.locationName, // I think it doesn't matter
                        colors: cell.checked ? [playerColor] : []
                    };
                })
            );
            this.boardRep.value.cells = cells;
            this.boardRep.value.colorCounts[playerColor] = checked;
        };
    }

    async configure(meta: ExternalBingoboardMeta): Promise<void> {
        if (meta.game !== 'archipelago') {
            log.error('not archipelago');
            return;
        }
        const slotdata = await this.client.login<BingoSlotData>(meta.url, meta.slot, 'APBingo', {
            slotData: true
        });
        await this.client.package.fetchPackage(['APBingo']);
        const bingoDataPackage = this.client.package.findPackage('APBingo');
        if (!bingoDataPackage) {
            throw new Error('could not fetch APBingo DataPackage!');
        }

        // Generate column labels (A, B, C, ...)
        const columns: string[] = Array.from({ length: slotdata.boardSize }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));

        // Generate row labels (1, 2, 3, ...)
        const rows: string[] = Array.from({ length: slotdata.boardSize }, (_, i) => String(i + 1));

        let goalIndex = 0;
        // we mostly don't want to show who owns the goal because it's irrelevant
        const locOwnerRe = /^(.*) \((.*)\)$/;

        this.board = columns.map((colChar) =>
            rows.map((rowChar) => {
                const locationName = `${colChar}${rowChar}`;
                const squareName = slotdata.boardLocations[goalIndex];
                const match = squareName.match(locOwnerRe);
                goalIndex++;
                return {
                    locationName,
                    checkHint: match?.[1] ?? squareName,
                    checkOwner: match?.[2] ?? '',
                    checked: false
                };
            })
        );

        // all squares are items sent from other games
        const receiveItems = (items: Item[]) => {
            items.forEach((item) => {
                const mappedItem = mapReceivedItemName(item.name);
                const square = this.board.flat().find((sq) => sq.locationName === mappedItem);
                if (square) {
                    square.checked = true;
                }
            });
            this.metaBoardUpdateFunc(boardMetaRep.value);
        };

        // listen to when locations are checked
        receiveItems(this.client.items.received);
        this.client.items.on('itemsReceived', receiveItems);

        boardMetaRep.on('change', this.metaBoardUpdateFunc);
    }

    async deactivate(): Promise<void> {
        boardMetaRep.off('change', this.metaBoardUpdateFunc);
        this.client.socket.disconnect();
    }
}
