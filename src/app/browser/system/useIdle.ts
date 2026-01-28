import { onMounted, onUnmounted, ref } from "vue";

export interface IdleOptions {
	timeout?: number;
	events?: string[];
	onIdle?: () => void;
	onActive?: () => void;
}

export function useIdle(options: IdleOptions = {}) {
	const {
		timeout = 60000, // 1 minute
		events = [
			"mousedown",
			"mousemove",
			"keypress",
			"scroll",
			"touchstart",
			"click",
		],
		onIdle,
		onActive,
	} = options;

	const isIdle = ref(false);
	const lastActive = ref(Date.now());

	let timer: number | null = null;

	const handleActivity = () => {
		lastActive.value = Date.now();

		if (isIdle.value) {
			isIdle.value = false;
			onActive?.();
		}

		resetTimer();
	};

	const startTimer = () => {
		if (timer) clearTimeout(timer);

		timer = window.setTimeout(() => {
			isIdle.value = true;
			onIdle?.();
		}, timeout);
	};

	const resetTimer = () => {
		startTimer();
	};

	const stopTimer = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	};

	const getIdleTime = () => {
		return Date.now() - lastActive.value;
	};

	const isIdleFor = (duration: number) => {
		return getIdleTime() >= duration;
	};

	onMounted(() => {
		events.forEach((event) => {
			window.addEventListener(event, handleActivity);
		});
		startTimer();
	});

	onUnmounted(() => {
		stopTimer();
		events.forEach((event) => {
			window.removeEventListener(event, handleActivity);
		});
	});

	return {
		isIdle,
		lastActive,
		getIdleTime,
		isIdleFor,
		resetTimer,
		stopTimer,
	};
}
