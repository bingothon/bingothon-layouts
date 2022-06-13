import clone from "clone";
import {AllGameLayouts, CurrentGameLayout} from "../../schemas";
import {RunDataActiveRun} from "../../speedcontrol-types";
import * as nodecgApiContext from "./util/nodecg-api-context";

const nodecg = nodecgApiContext.get();

const allGameLayoutsRep = nodecg.Replicant<AllGameLayouts>('allGameLayouts');
const currentGameLayoutRep = nodecg.Replicant<CurrentGameLayout>('currentGameLayout');
const runDataActiveRunRep = nodecg.Replicant<RunDataActiveRun>('runDataActiveRun', 'nodecg-speedcontrol');
const logger = new nodecg.Logger(`${nodecg.bundleName}:layoutlogic`);

runDataActiveRunRep.on('change', (newValue, old): void => {
    // bail on server restart
    if (!newValue || !old) return;
    let layoutstring: string;
    switch (newValue?.customData.Layout) {
        case '16:9 2p 2v2':
            layoutstring = '2p 16:9 Layout 2v2';
            break;
        case '16:9 3p Trackers':
            layoutstring = '3p 16:9 Layout Trackers';
            break;
        case '16:9 4p Trackers':
            layoutstring = '4p 16:9 Layout Trackers';
            break
        case '16:9 4P Trackers Co-Op':
            layoutstring = '4p 16:9 co-op Layout Trackers';
            break;
        default:
            let playerCount = 0;
            let coOp = false;
            for (let i = 0; i < newValue.teams.length; i += 1) {
                const team = newValue.teams[i];
                // eslint-disable-next-line no-loop-func
                team.players.forEach((): void => {
                    playerCount += 1;
                });
            }
            if (playerCount === 4 && newValue.teams.length === 2) {
                coOp = true;
            }
            layoutstring = `${playerCount}p ${newValue.customData.Layout} ${coOp ? 'co-op ' : ''}Layout`;
    }
    const foundLayout = allGameLayoutsRep.value?.find(l => l.name == layoutstring);
    foundLayout ? currentGameLayoutRep.value = clone(foundLayout) : logger.error('did not find game layout ' + layoutstring);
});
