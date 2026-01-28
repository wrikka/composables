import { onMounted, onUnmounted, ref } from "vue";

export interface SpeechRecognitionOptions {
	lang?: string;
	continuous?: boolean;
	interimResults?: boolean;
	maxAlternatives?: number;
	grammars?: string[];
}

export interface SpeechRecognitionResult {
	transcript: string;
	confidence: number;
	isFinal: boolean;
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
	const {
		lang: initialLang = "en-US",
		continuous: initialContinuous = false,
		interimResults: initialInterimResults = true,
		maxAlternatives = 1,
		grammars = [],
	} = options;

	let lang = initialLang;
	let continuous = initialContinuous;
	let interimResults = initialInterimResults;

	const isSupported = ref(false);
	const isListening = ref(false);
	const isPaused = ref(false);
	const transcript = ref("");
	const interimTranscript = ref("");
	const error = ref<string | null>(null);
	const results = ref<SpeechRecognitionResult[]>([]);

	let recognition: any = null;

	const initialize = () => {
		if (
			!("webkitSpeechRecognition" in window) &&
			!("SpeechRecognition" in window)
		) {
			isSupported.value = false;
			return;
		}

		const SpeechRecognitionAPI =
			(window as any).SpeechRecognition ||
			(window as any).webkitSpeechRecognition;
		recognition = new SpeechRecognitionAPI();

		recognition.lang = lang;
		recognition.continuous = continuous;
		recognition.interimResults = interimResults;
		recognition.maxAlternatives = maxAlternatives;

		if (grammars.length > 0) {
			const SpeechGrammarList = (window as any).SpeechGrammarList;
			const grammarList = new SpeechGrammarList();
			grammars.forEach((grammar) => {
				grammarList.addFromString(grammar, 1);
			});
			recognition.grammars = grammarList;
		}

		recognition.onstart = () => {
			isListening.value = true;
			isPaused.value = false;
			error.value = null;
			transcript.value = "";
			interimTranscript.value = "";
			results.value = [];
		};

		recognition.onresult = (event: any) => {
			let finalTranscript = "";
			let interimTrans = "";

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];

				if (result.isFinal) {
					finalTranscript += result[0].transcript;
					results.value.push({
						transcript: result[0].transcript,
						confidence: result[0].confidence,
						isFinal: true,
					});
				} else {
					interimTrans += result[0].transcript;
					results.value.push({
						transcript: result[0].transcript,
						confidence: result[0].confidence,
						isFinal: false,
					});
				}
			}

			transcript.value += finalTranscript;
			interimTranscript.value = interimTrans;
		};

		recognition.onerror = (event: any) => {
			error.value = `Speech recognition error: ${event.error}`;
			isListening.value = false;
			isPaused.value = false;
		};

		recognition.onend = () => {
			isListening.value = false;
			isPaused.value = false;
			interimTranscript.value = "";
		};

		isSupported.value = true;
	};

	const start = () => {
		if (!isSupported.value) {
			error.value = "Speech recognition is not supported";
			return;
		}

		if (recognition && !isListening.value) {
			recognition.start();
		}
	};

	const stop = () => {
		if (recognition && isListening.value) {
			recognition.stop();
		}
	};

	const abort = () => {
		if (recognition && isListening.value) {
			recognition.abort();
		}
	};

	const pause = () => {
		if (recognition && isListening.value && !isPaused.value) {
			recognition.stop();
			isPaused.value = true;
		}
	};

	const resume = () => {
		if (recognition && isPaused.value) {
			recognition.start();
			isPaused.value = false;
		}
	};

	const clear = () => {
		transcript.value = "";
		interimTranscript.value = "";
		results.value = [];
		error.value = null;
	};

	const setLang = (newLang: string) => {
		lang = newLang;
		if (recognition) {
			recognition.lang = newLang;
		}
	};

	const setContinuous = (newContinuous: boolean) => {
		continuous = newContinuous;
		if (recognition) {
			recognition.continuous = newContinuous;
		}
	};

	const setInterimResults = (newInterimResults: boolean) => {
		interimResults = newInterimResults;
		if (recognition) {
			recognition.interimResults = newInterimResults;
		}
	};

	onMounted(() => {
		initialize();
	});

	onUnmounted(() => {
		if (recognition && isListening.value) {
			recognition.abort();
		}
	});

	return {
		isSupported,
		isListening,
		isPaused,
		transcript,
		interimTranscript,
		error,
		results,
		start,
		stop,
		abort,
		pause,
		resume,
		clear,
		setLang,
		setContinuous,
		setInterimResults,
	};
}
