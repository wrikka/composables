import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSpeechRecognition } from "./useSpeechRecognition";

describe("useSpeechRecognition", () => {
	let mockRecognition: any;

	beforeEach(() => {
		vi.clearAllMocks();

		mockRecognition = {
			lang: "",
			continuous: false,
			interimResults: true,
			maxAlternatives: 1,
			grammars: null,
			onstart: null,
			onresult: null,
			onerror: null,
			onend: null,
			start: vi.fn(),
			stop: vi.fn(),
			abort: vi.fn(),
		};

		vi.stubGlobal("window", {
			SpeechRecognition: vi.fn(() => mockRecognition),
			webkitSpeechRecognition: vi.fn(() => mockRecognition),
			SpeechGrammarList: vi.fn(() => ({
				addFromString: vi.fn(),
			})),
		});
	});

	it("should initialize with default values", () => {
		const {
			isSupported,
			isListening,
			isPaused,
			transcript,
			interimTranscript,
			error,
			results,
		} = useSpeechRecognition();

		expect(isSupported.value).toBe(true);
		expect(isListening.value).toBe(false);
		expect(isPaused.value).toBe(false);
		expect(transcript.value).toBe("");
		expect(interimTranscript.value).toBe("");
		expect(error.value).toBe(null);
		expect(results.value).toEqual([]);
	});

	it("should handle unsupported browser", () => {
		vi.stubGlobal("window", {});

		const { isSupported } = useSpeechRecognition();

		expect(isSupported.value).toBe(false);

		vi.unstubAllGlobals();
	});

	it("should use custom options", () => {
		const { setLang, setContinuous, setInterimResults } = useSpeechRecognition({
			lang: "fr-FR",
			continuous: true,
			interimResults: false,
			maxAlternatives: 3,
		});

		setLang("fr-FR");
		setContinuous(true);
		setInterimResults(false);

		expect(mockRecognition.lang).toBe("fr-FR");
		expect(mockRecognition.continuous).toBe(true);
		expect(mockRecognition.interimResults).toBe(false);
		expect(mockRecognition.maxAlternatives).toBe(3);
	});

	it("should start recognition", () => {
		const { start } = useSpeechRecognition();

		start();

		expect(mockRecognition.start).toHaveBeenCalled();
	});

	it("should handle recognition start event", () => {
		const {
			start,
			isListening,
			isPaused,
			transcript,
			interimTranscript,
			results,
		} = useSpeechRecognition();

		start();
		mockRecognition.onstart();

		expect(isListening.value).toBe(true);
		expect(isPaused.value).toBe(false);
		expect(transcript.value).toBe("");
		expect(interimTranscript.value).toBe("");
		expect(results.value).toEqual([]);
	});

	it("should handle final recognition result", () => {
		const { start, transcript, results } = useSpeechRecognition();

		start();

		const mockEvent = {
			resultIndex: 0,
			results: [
				{
					isFinal: true,
					0: {
						transcript: "Hello world",
						confidence: 0.95,
					},
				},
			],
		};

		mockRecognition.onresult(mockEvent);

		expect(transcript.value).toBe("Hello world");
		expect(results.value).toEqual([
			{
				transcript: "Hello world",
				confidence: 0.95,
				isFinal: true,
			},
		]);
	});

	it("should handle interim recognition result", () => {
		const { start, interimTranscript, results } = useSpeechRecognition();

		start();

		const mockEvent = {
			resultIndex: 0,
			results: [
				{
					isFinal: false,
					0: {
						transcript: "Hello",
						confidence: 0.8,
					},
				},
			],
		};

		mockRecognition.onresult(mockEvent);

		expect(interimTranscript.value).toBe("Hello");
		expect(results.value).toEqual([
			{
				transcript: "Hello",
				confidence: 0.8,
				isFinal: false,
			},
		]);
	});

	it("should handle multiple results", () => {
		const { start, transcript, results, interimTranscript } =
			useSpeechRecognition();

		start();

		const mockEvent = {
			resultIndex: 0,
			results: [
				{
					isFinal: true,
					0: {
						transcript: "Hello",
						confidence: 0.9,
					},
				},
				{
					isFinal: false,
					0: {
						transcript: " world",
						confidence: 0.7,
					},
				},
			],
		};

		mockRecognition.onresult(mockEvent);

		expect(transcript.value).toBe("Hello");
		expect(interimTranscript.value).toBe(" world");
		expect(results.value).toHaveLength(2);
	});

	it("should handle recognition error", () => {
		const { start, error, isListening, isPaused } = useSpeechRecognition();

		start();
		mockRecognition.onerror({ error: "no-speech" });

		expect(error.value).toBe("Speech recognition error: no-speech");
		expect(isListening.value).toBe(false);
		expect(isPaused.value).toBe(false);
	});

	it("should handle recognition end event", () => {
		const { start, isListening, isPaused, interimTranscript } =
			useSpeechRecognition();

		start();
		mockRecognition.onend();

		expect(isListening.value).toBe(false);
		expect(isPaused.value).toBe(false);
		expect(interimTranscript.value).toBe("");
	});

	it("should stop recognition", () => {
		const { start, stop, isListening } = useSpeechRecognition();

		start();
		isListening.value = true;

		stop();

		expect(mockRecognition.stop).toHaveBeenCalled();
	});

	it("should abort recognition", () => {
		const { start, abort, isListening } = useSpeechRecognition();

		start();
		isListening.value = true;

		abort();

		expect(mockRecognition.abort).toHaveBeenCalled();
	});

	it("should pause and resume recognition", () => {
		const { start, pause, resume, isListening, isPaused } =
			useSpeechRecognition();

		start();
		isListening.value = true;

		pause();

		expect(mockRecognition.stop).toHaveBeenCalled();
		expect(isPaused.value).toBe(true);

		resume();

		expect(mockRecognition.start).toHaveBeenCalledTimes(2); // Once for start, once for resume
		expect(isPaused.value).toBe(false);
	});

	it("should clear all data", () => {
		const { start, clear, transcript, interimTranscript, error, results } =
			useSpeechRecognition();

		start();

		// Simulate some data
		transcript.value = "Hello";
		interimTranscript.value = " world";
		error.value = "Some error";
		results.value = [{ transcript: "Hello", confidence: 0.9, isFinal: true }];

		clear();

		expect(transcript.value).toBe("");
		expect(interimTranscript.value).toBe("");
		expect(error.value).toBe(null);
		expect(results.value).toEqual([]);
	});

	it("should handle unsupported browser when starting", () => {
		vi.stubGlobal("window", {});

		const { start, error } = useSpeechRecognition();

		start();

		expect(error.value).toBe("Speech recognition is not supported");

		vi.unstubAllGlobals();
	});

	it("should set language dynamically", () => {
		const { setLang } = useSpeechRecognition();

		setLang("es-ES");

		expect(mockRecognition.lang).toBe("es-ES");
	});

	it("should set continuous mode dynamically", () => {
		const { setContinuous } = useSpeechRecognition();

		setContinuous(true);

		expect(mockRecognition.continuous).toBe(true);
	});

	it("should set interim results dynamically", () => {
		const { setInterimResults } = useSpeechRecognition();

		setInterimResults(false);

		expect(mockRecognition.interimResults).toBe(false);
	});

	it("should handle grammars", () => {
		const grammars = ["JSGF Grammar 1", "JSGF Grammar 2"];

		useSpeechRecognition({ grammars });

		expect(mockRecognition.grammars).toBeTruthy();
	});

	it("should abort on unmount", () => {
		const { start } = useSpeechRecognition();

		start();

		// Simulate unmount
		const { onUnmounted } = require("vue");
		const unmountCallback = onUnmounted.mock.calls[0][0];
		unmountCallback();

		expect(mockRecognition.abort).toHaveBeenCalled();
	});

	it("should not start if already listening", () => {
		const { start } = useSpeechRecognition();

		start();
		start(); // Try to start again

		expect(mockRecognition.start).toHaveBeenCalledTimes(1);
	});

	it("should not stop if not listening", () => {
		const { stop } = useSpeechRecognition();

		stop();

		expect(mockRecognition.stop).not.toHaveBeenCalled();
	});

	it("should not pause if not listening", () => {
		const { pause } = useSpeechRecognition();

		pause();

		expect(mockRecognition.stop).not.toHaveBeenCalled();
	});

	it("should not resume if not paused", () => {
		const { resume } = useSpeechRecognition();

		resume();

		expect(mockRecognition.start).toHaveBeenCalledTimes(1); // Only from initialization
	});
});
