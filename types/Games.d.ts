export type Games = {
    [k: string]: {
        editors: {
            [l: boolean]
        }[];
        owner: string;
        passcode: string
        items: {
            [m: any]
        }[]
    }
}[]
