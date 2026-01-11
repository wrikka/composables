import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSpeechSynthesis } from "./useSpeechSynthesis";

describe("useSpeechSynthesis", () => {
	let mockSpeechSynthesis: any;
	let mockUtterance: any;

	beforeEach(() => {
		vi.clearAllMocks();

		mockUtterance = {
			onstart: null,
			onend: null,
			onpause: null,
			onresume: null,
			onerror: null,
			text: "",
			voice: null,
			pitch: 1,
			rate: 1,
			volume: 1,
			lang: "en-US",
		};

		mockSpeechSynthesis = {
			speak: vi.fn(),
			pause: vi.fn(),
			resume: vi.fn(),
			cancel: vi.fn(),
			getVoices: vi.fn(() => [
				{ name: "Alex", lang: "en-US" },
				{ name: "Daniel", lang: "en-GB" },
				{ name: "Marie", lang: "fr-FR" },
			]),
			onvoiceschanged: null,
		};

		vi.stubGlobal("window", {
			speechSynthesis: mockSpeechSynthesis,
			SpeechSynthesisUtterance: vi.fn(() => mockUtterance),
		});
	});

	it("should initialize with default values", () => {
		const { isSupported, isSpeaking, isPaused, isFinished, error, speechText } =
			useSpeechSynthesis();

		expect(isSupported.value).toBe(true);
		expect(isSpeaking.value).toBe(false);
		expect(isPaused.value).toBe(false);
		expect(isFinished.value).toBe(false);
		expect(error.value).toBe(null);
		expect(speechText.value).toBe("");
	});

	it("should handle unsupported browser", () => {
		vi.stubGlobal("window", { speechSynthesis: undefined });

		const { isSupported } = useSpeechSynthesis();

		expect(isSupported.value).toBe(false);

		vi.unstubAllGlobals();
	});

	it("should use custom options", () => {
		const { speechText, speechPitch, speechRate, speechVolume, speechLang } =
			useSpeechSynthesis({
				text: "Hello world",
				pitch: 1.5,
				rate: 0.8,
				volume: 0.5,
				lang: "fr-FR",
			});

		expect(speechText.value).toBe("Hello world");
		expect(speechPitch.value).toBe(1.5);
		expect(speechRate.value).toBe(0.8);
		expect(speechVolume.value).toBe(0.5);
		expect(speechLang.value).toBe("fr-FR");
	});

	it("should load voices", () => {
		const { voices } = useSpeechSynthesis();

		expect(voices.value).toHaveLength(3);
		expect(voices.value[0]?.name).toBe("Alex");
		expect(voices.value[1]?.name).toBe("Daniel");
		expect(voices.value[2]?.name).toBe("Marie");
	});

	it("should speak text", () => {
		const { speak, speechText } = useSpeechSynthesis();

		speechText.value = "Hello world";
		speak();

		expect(window.SpeechSynthesisUtterance).toHaveBeenCalledWith("Hello world");
		expect(mockSpeechSynthesis.speak).toHaveBeenCalledWith(mockUtterance);
	});

	it("should speak with new text", () => {
		const { speak } = useSpeechSynthesis();

		speak("New text");

		expect(window.SpeechSynthesisUtterance).toHaveBeenCalledWith("New text");
		expect(mockSpeechSynthesis.speak).toHaveBeenCalledWith(mockUtterance);
	});

	it("should handle speech start event", () => {
		const { isSpeaking, isPaused, isFinished, speak } = useSpeechSynthesis();

		speak("test");
		mockUtterance.onstart();

		expect(isSpeaking.value).toBe(true);
		expect(isPaused.value).toBe(false);
		expect(isFinished.value).toBe(false);
	});

	it("should handle speech end event", () => {
		const { isSpeaking, isPaused, isFinished, speak } = useSpeechSynthesis();

		speak("test");
		mockUtterance.onstart();
		mockUtterance.onend();

		expect(isSpeaking.value).toBe(false);
		expect(isPaused.value).toBe(false);
		expect(isFinished.value).toBe(true);
	});

	it("should handle speech pause event", () => {
		const { isPaused, speak } = useSpeechSynthesis();

		speak("test");
		mockUtterance.onpause();

		expect(isPaused.value).toBe(true);
	});

	it("should handle speech resume event", () => {
		const { isPaused, speak } = useSpeechSynthesis();

		speak("test");
		mockUtterance.onpause();
		mockUtterance.onresume();

		expect(isPaused.value).toBe(false);
	});

	it("should handle speech error event", () => {
		const { error, speak, isSpeaking } = useSpeechSynthesis();

		speak("test");
		mockUtterance.onerror({ error: "network" });

		expect(error.value).toBe("Speech synthesis error: network");
		expect(isSpeaking.value).toBe(false);
	});

	it("should pause speech", () => {
		const { pause, isSpeaking } = useSpeechSynthesis();

		isSpeaking.value = true;
		pause();

		expect(mockSpeechSynthesis.pause).toHaveBeenCalled();
	});

	it("should resume speech", () => {
		const { resume, isPaused } = useSpeechSynthesis();

		isPaused.value = true;
		resume();

		expect(mockSpeechSynthesis.resume).toHaveBeenCalled();
	});

	it("should cancel speech", () => {
		const { cancel, isSpeaking, isPaused, isFinished } = useSpeechSynthesis();

		isSpeaking.value = true;
		isPaused.value = true;
		isFinished.value = true;

		cancel();

		expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
		expect(isSpeaking.value).toBe(false);
		expect(isPaused.value).toBe(false);
		expect(isFinished.value).toBe(false);
	});

	it("should cancel before speaking new text", () => {
		const { speak } = useSpeechSynthesis();

		speak("first");
		speak("second");

		expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(1);
		expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(2);
	});

	it("should handle empty text error", () => {
		const { speak, error } = useSpeechSynthesis();

		speak("");

		expect(error.value).toBe("No text to speak");
		expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
	});

	it("should handle unsupported browser error", () => {
		vi.stubGlobal("window", { speechSynthesis: undefined });

		const { speak, error } = useSpeechSynthesis();

		speak("test");

		expect(error.value).toBe("Speech synthesis is not supported");

		vi.unstubAllGlobals();
	});

	it("should get voice by name", () => {
		const { getVoiceByName } = useSpeechSynthesis();

		const voice = getVoiceByName("Alex");
		expect(voice?.name).toBe("Alex");

		const nonExistent = getVoiceByName("NonExistent");
		expect(nonExistent).toBeUndefined();
	});

	it("should get voices by language", () => {
		const { getVoicesByLang } = useSpeechSynthesis();

		const englishVoices = getVoicesByLang("en");
		expect(englishVoices).toHaveLength(2);

		const frenchVoices = getVoicesByLang("fr");
		expect(frenchVoices).toHaveLength(1);
		expect(frenchVoices[0]?.name).toBe("Marie");
	});

	it("should set voice", () => {
		const { setVoice, selectedVoice } = useSpeechSynthesis();

		setVoice("Daniel");
		expect(selectedVoice.value).toBe("Daniel");
	});

	it("should set pitch with bounds", () => {
		const { setPitch, speechPitch } = useSpeechSynthesis();

		setPitch(1.5);
		expect(speechPitch.value).toBe(1.5);

		setPitch(-1); // Below minimum
		expect(speechPitch.value).toBe(0);

		setPitch(3); // Above maximum
		expect(speechPitch.value).toBe(2);
	});

	it("should set rate with bounds", () => {
		const { setRate, speechRate } = useSpeechSynthesis();

		setRate(2);
		expect(speechRate.value).toBe(2);

		setRate(0.05); // Below minimum
		expect(speechRate.value).toBe(0.1);

		setRate(15); // Above maximum
		expect(speechRate.value).toBe(10);
	});

	it("should set volume with bounds", () => {
		const { setVolume, speechVolume } = useSpeechSynthesis();

		setVolume(0.5);
		expect(speechVolume.value).toBe(0.5);

		setVolume(-0.5); // Below minimum
		expect(speechVolume.value).toBe(0);

		setVolume(1.5); // Above maximum
		expect(speechVolume.value).toBe(1);
	});

	it("should set text", () => {
		const { setText, speechText } = useSpeechSynthesis();

		setText("New text");
		expect(speechText.value).toBe("New text");
	});

	it("should set language", () => {
		const { setLang, speechLang } = useSpeechSynthesis();

		setLang("es-ES");
		expect(speechLang.value).toBe("es-ES");
	});

	it("should apply voice to utterance", () => {
		const { speak, setVoice } = useSpeechSynthesis();

		setVoice("Alex");
		speak("test");

		expect(mockUtterance.voice).toEqual({ name: "Alex", lang: "en-US" });
	});

	it("should handle voiceschanged event", () => {
		useSpeechSynthesis();

		// Simulate voiceschanged event
		mockSpeechSynthesis.onvoiceschanged();

		expect(mockSpeechSynthesis.getVoices).toHaveBeenCalled();
	});
});
