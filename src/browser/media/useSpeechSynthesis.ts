import { onMounted, onUnmounted, ref } from "vue";

export interface SpeechSynthesisOptions {
	text?: string;
	voice?: string;
	pitch?: number;
	rate?: number;
	volume?: number;
	lang?: string;
}

export function useSpeechSynthesis(options: SpeechSynthesisOptions = {}) {
	const {
		text = "",
		voice,
		pitch = 1,
		rate = 1,
		volume = 1,
		lang = "en-US",
	} = options;

	const isSupported = ref(!!window.speechSynthesis);
	const isSpeaking = ref(false);
	const isPaused = ref(false);
	const isFinished = ref(false);
	const error = ref<string | null>(null);

	const speechText = ref(text);
	const selectedVoice = ref(voice);
	const speechPitch = ref(pitch);
	const speechRate = ref(rate);
	const speechVolume = ref(volume);
	const speechLang = ref(lang);

	let utterance: SpeechSynthesisUtterance | null = null;

	const voices = ref<SpeechSynthesisVoice[]>([]);

	const updateVoices = () => {
		if (isSupported.value) {
			voices.value = window.speechSynthesis.getVoices();
		}
	};

	const createUtterance = (): SpeechSynthesisUtterance => {
		utterance = new SpeechSynthesisUtterance(speechText.value);

		if (selectedVoice.value) {
			const voice = voices.value.find((v) => v.name === selectedVoice.value);
			if (voice) utterance.voice = voice;
		}

		utterance.pitch = speechPitch.value;
		utterance.rate = speechRate.value;
		utterance.volume = speechVolume.value;
		utterance.lang = speechLang.value;

		utterance.onstart = () => {
			isSpeaking.value = true;
			isPaused.value = false;
			isFinished.value = false;
			error.value = null;
		};

		utterance.onend = () => {
			isSpeaking.value = false;
			isPaused.value = false;
			isFinished.value = true;
		};

		utterance.onpause = () => {
			isPaused.value = true;
		};

		utterance.onresume = () => {
			isPaused.value = false;
		};

		utterance.onerror = (event) => {
			error.value = `Speech synthesis error: ${event.error}`;
			isSpeaking.value = false;
			isPaused.value = false;
		};

		return utterance;
	};

	const speak = (newText?: string) => {
		if (!isSupported.value) {
			error.value = "Speech synthesis is not supported";
			return;
		}

		if (newText) {
			speechText.value = newText;
		}

		if (!speechText.value) {
			error.value = "No text to speak";
			return;
		}

		// Cancel any ongoing speech
		window.speechSynthesis.cancel();

		const utter = createUtterance();
		window.speechSynthesis.speak(utter);
	};

	const pause = () => {
		if (isSupported.value && isSpeaking.value) {
			window.speechSynthesis.pause();
		}
	};

	const resume = () => {
		if (isSupported.value && isPaused.value) {
			window.speechSynthesis.resume();
		}
	};

	const cancel = () => {
		if (isSupported.value) {
			window.speechSynthesis.cancel();
			isSpeaking.value = false;
			isPaused.value = false;
			isFinished.value = false;
		}
	};

	const getVoiceByName = (name: string): SpeechSynthesisVoice | undefined => {
		return voices.value.find((voice) => voice.name === name);
	};

	const getVoicesByLang = (lang: string): SpeechSynthesisVoice[] => {
		return voices.value.filter((voice) => voice.lang.startsWith(lang));
	};

	const setText = (newText: string) => {
		speechText.value = newText;
	};

	const setVoice = (voiceName: string) => {
		selectedVoice.value = voiceName;
	};

	const setPitch = (newPitch: number) => {
		speechPitch.value = Math.max(0, Math.min(2, newPitch));
	};

	const setRate = (newRate: number) => {
		speechRate.value = Math.max(0.1, Math.min(10, newRate));
	};

	const setVolume = (newVolume: number) => {
		speechVolume.value = Math.max(0, Math.min(1, newVolume));
	};

	const setLang = (newLang: string) => {
		speechLang.value = newLang;
	};

	onMounted(() => {
		if (isSupported.value) {
			updateVoices();
			window.speechSynthesis.onvoiceschanged = updateVoices;
		}
	});

	onUnmounted(() => {
		cancel();
	});

	return {
		isSupported,
		isSpeaking,
		isPaused,
		isFinished,
		error,
		voices,
		speechText,
		selectedVoice,
		speechPitch,
		speechRate,
		speechVolume,
		speechLang,
		speak,
		pause,
		resume,
		cancel,
		getVoiceByName,
		getVoicesByLang,
		setText,
		setVoice,
		setPitch,
		setRate,
		setVolume,
		setLang,
	};
}
