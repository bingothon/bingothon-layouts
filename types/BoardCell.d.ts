import { BoardColor } from './BoardColor';

export interface BingoboardCell {
    name: string;
    slot: string;
    colors: string[];
    rawColors: string;
    markers: [string | null, string | null, string | null, string | null];
}

export interface BingosyncCell {
    name: string;
    slot: string;
    colors: string;
}
