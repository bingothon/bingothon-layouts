import { Bingoboard } from 'schemas';

export type BingoboardCell = Bingoboard['cells'][number][number];

export interface BingosyncCell {
    name: string;
    slot: string;
    colors: string;
}
