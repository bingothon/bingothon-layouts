import type NodeCG from '@nodecg/types';

// ServerReplicant and ServerReplicantWithSchemaDefault cannot be instantiated in the same type
export function waitForReplicants(
    replicants: (NodeCG.ServerReplicant<unknown> | NodeCG.ServerReplicantWithSchemaDefault<unknown>)[],
    callback: () => void
): void {
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
