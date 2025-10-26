import { Bingoboard } from 'schemas';
import { BoardColor } from './BoardColor';

export type BingoboardCell = Bingoboard["cells"][number][number];

export interface BingosyncCell {
    name: string;
    slot: string;
    colors: string;
}
