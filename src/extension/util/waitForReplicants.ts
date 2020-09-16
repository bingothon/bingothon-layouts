import { Replicant } from 'nodecg/types/server';

export function waitForReplicants(replicants: Replicant<unknown>[], callback: Function): void {
    let count = 0;
    replicants.forEach((r): void => {
        r.once('change', (): void => {
        count += 1;
        if (count === replicants.length) {
            callback();
        }
        });
    });
}