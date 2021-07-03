export type Games = {
    [k: string]: {
        editors: {
            [j: boolean]
        }[];
        owner: string;
        passcode: string
    }
}[]
