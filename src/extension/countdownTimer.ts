import * as nodecgApiContext from './util/nodecg-api-context';
import { CountdownTimer, LayoutTimer } from '../../schemas';
import NodeCG from '@nodecg/types';

const nodecg = nodecgApiContext.get();
const log = new nodecg.Logger(`${nodecg.bundleName}:countdownTimer`);

const countdownTimerRep = nodecg.Replicant<CountdownTimer>('countdownTimer');
const layoutTimerRep = nodecg.Replicant<LayoutTimer>('layoutTimer');

function formatSeconds(secs: number): string {
    let formatted = '';
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);
    if (hours > 0) {
        formatted = hours.toFixed(0) + ':';
    }
    formatted += minutes.toFixed(0).padStart(2, '0');
    formatted += ':';
    formatted += seconds.toFixed(0).padStart(2, '0');
    return formatted;
}

createTimer(countdownTimerRep, 'countdownTimer', -1);
createTimer(layoutTimerRep, 'layoutTimer', 1);

function createTimer(replicant: NodeCG.ServerReplicant<CountdownTimer>, timerName: string, step: number) {
    let currentNextTick: NodeJS.Timeout | null = null;
    function startTimer() {
        if (currentNextTick === null) {
            currentNextTick = setInterval(nextTick, 1000);
        }
    }

    function stopTimer() {
        if (currentNextTick !== null) {
            clearInterval(currentNextTick);
            currentNextTick = null;
        }
    }

    function nextTick() {
        if (replicant.value?.state !== 'running') return;
        const secs = replicant.value.timeS + step;
        if (secs <= 0 && step < 0) {
            replicant.value = {
                state: "stopped",
                time: formatSeconds(0),
                timeS: 0,
            };
            stopTimer();
        } else {
            replicant.value = {
                state: "running",
                time: formatSeconds(secs),
                timeS: secs,
            };
        }
    }

    // startup recovery
    replicant.once('change', newVal => {
        if (newVal?.state === 'running') {
            startTimer();
        }
    });

    nodecg.listenFor(`${timerName}:start`, (_data, callback): void => {
        log.info(`start (${timerName})!`);
        if (replicant.value) {
            replicant.value.state = 'running';
            startTimer();
        }
        if (callback && !callback.handled) {
            callback();
        }
    });

    nodecg.listenFor(`${timerName}:stop`, (_data, callback): void => {
        log.info(`stop (${timerName})!`);
        if (replicant.value) {
            replicant.value.state = 'stopped';
            stopTimer();
        }
        if (callback && !callback.handled) {
            callback();
        }
    });

    nodecg.listenFor(`${timerName}:setTime`, (time: number, callback) => {
        log.info(`setTime (${timerName}): ${time}`);
        if (time < 0) {
            if (callback && !callback.handled) {
                callback("time has to be >= 0!");
            }
        } else {
            if (replicant.value) {
                replicant.value.time = formatSeconds(time);
                replicant.value.timeS = time;
            }
            if (callback && !callback.handled) {
                callback();
            }
        }
    });
}
