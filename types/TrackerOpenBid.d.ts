export type TrackerOpenBid = {
    game: string;
    bid: string;
    goal: number | null;
    amount_raised: number;
    allow_custom_options: boolean;
    state: 'PENDING' | 'DENIED' | 'HIDDEN' | 'OPENED' | 'CLOSED';
    run_started: boolean;
    options: {
        name: string;
        amount_raised: number;
    }[];
};
