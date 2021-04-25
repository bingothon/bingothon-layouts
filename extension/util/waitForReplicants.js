"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForReplicants = void 0;
function waitForReplicants(replicants, callback) {
    let count = 0;
    replicants.forEach((r) => {
        r.once('change', () => {
            count += 1;
            if (count === replicants.length) {
                callback();
            }
        });
    });
}
exports.waitForReplicants = waitForReplicants;
