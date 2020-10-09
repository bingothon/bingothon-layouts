import * as nodecgApiContext from './util/nodecg-api-context';
import { CountdownTimer } from '../../schemas';

const nodecg = nodecgApiContext.get();
const log = new nodecg.Logger(`${nodecg.bundleName}:countdownTimer`);

let currentNextTick: NodeJS.Timeout | null = null;

const countdownTimerRep = nodecg.Replicant<CountdownTimer>('countdownTimer');

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
	if (countdownTimerRep.value.state !== 'running') return;
	let secs = countdownTimerRep.value.timeS - 1;
	if (secs <= 0) {
		countdownTimerRep.value = {
			state: "stopped",
			time: formatSeconds(0),
			timeS: 0,
		};
		stopTimer();
	} else {
		countdownTimerRep.value = {
			state: "running",
			time: formatSeconds(secs),
			timeS: secs,
		};
	}
}

// startup recovery
countdownTimerRep.once('change', newVal => {
	if (newVal.state === 'running') {
		startTimer();
	}
});

nodecg.listenFor('countdownTimer:start', (_data, callback): void => {
	log.info("start!");
	countdownTimerRep.value.state = 'running';
	startTimer();
	if (callback && !callback.handled) {
		callback();
	}
});

nodecg.listenFor('countdownTimer:stop', (_data, callback): void => {
	log.info("stop!");
	countdownTimerRep.value.state = 'stopped';
	stopTimer();
	if (callback && !callback.handled) {
		callback();
	}
});

nodecg.listenFor('countdownTimer:setTime', (time: number, callback) => {
	log.info("setTime: "+time);
	if (time < 0) {
		if (callback && !callback.handled) {
			callback("time has to be >= 0!");
		}
	} else {
		countdownTimerRep.value.time = formatSeconds(time);
		countdownTimerRep.value.timeS = time;
		if (callback && !callback.handled) {
			callback();
		}
	}
});
