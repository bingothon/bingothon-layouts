type PositionOptions = 'top' | 'bottom' | 'left' | 'right' | 'center' | 'width' | 'height';
type Position = {
    [key in PositionOptions]?: number;
};

export interface GameLayoutInterface {
    streams: Position[];
    players: Position[];
    game: Position;
    discord: Position;
    bingoboard: Position;
    sponsor: Position;
    timer: Position;
    teams?: Position[];
    fillbar?: Position;
    playercams?: Position[];
    trackers?: Position[];
}

// example of config of 4_3-4p-co-op.vue

export const layout: GameLayoutInterface = {
    streams: [
        {
            top: 0,
            left: 0,
            width: 100,
            height: 100,
        },
        {
            top: 0,
            left: 100,
            width: 100,
            height: 100,
        },
        {
            top: 100,
            left: 0,
            width: 100,
            height: 100,
        },
        {
            top: 100,
            left: 100,
            width: 100,
            height: 100,
        },
    ],
    players: [
        {
            top: 0,
            left: 0,
            width: 100,
            height: 100,
        },
        {
            top: 0,
            left: 100,
            width: 100,
            height: 100,
        },
        {
            top: 100,
            left: 0,
            width: 100,
            height: 100,
        },
        {
            top: 100,
            left: 100,
            width: 100,
            height: 100,
        },
    ],
    game: {
        top: 0,
        left: 0,
        width: 100,
        height: 100,
    },
    discord: {
        top: 0,
        left: 0,
        width: 100,
        height: 100,
    },
    bingoboard: {
        top: 0,
        left: 0,
        width: 100,
        height: 100,
    },
    sponsor: {
        top: 0,
        left: 0,
        width: 100,
        height: 100,
    },
    timer: {
        top: 0,
        left: 0,
        width: 100,
        height: 100,
    },
};
