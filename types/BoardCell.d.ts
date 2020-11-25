import { BoardColor } from "./BoardColor";

export interface BingoboardCell {
    name: string;
    slot: string;
    colors: BoardColor[];
    rawColors: string | null;
    markers: [string | null, string | null, string | null, string | null];
}

export interface BingosyncCell {
    name: string;
    slot: string;
    colors: string;
}
