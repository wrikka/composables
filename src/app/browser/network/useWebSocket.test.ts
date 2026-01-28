import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWebSocket } from "./useWebSocket";

describe("useWebSocket", () => {
	let mockWebSocket: any;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		mockWebSocket = {
			readyState: WebSocket.CONNECTING,
			onopen: null,
			onmessage: null,
			onclose: null,
			onerror: null,
			send: vi.fn(),
			close: vi.fn(),
		};

		vi.stubGlobal(
			"WebSocket",
			vi.fn(() => mockWebSocket),
		);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should initialize with default values", () => {
		const {
			isConnected,
			isConnecting,
			error,
			lastMessage,
			messageHistory,
			reconnectAttempts,
		} = useWebSocket({
			url: "ws://localhost:8080",
		});

		expect(isConnected.value).toBe(false);
		expect(isConnecting.value).toBe(true);
		expect(error.value).toBe(null);
		expect(lastMessage.value).toBe(null);
		expect(messageHistory.value).toEqual([]);
		expect(reconnectAttempts.value).toBe(0);
	});

	it("should connect to WebSocket", () => {
		const { isConnecting } = useWebSocket({
			url: "ws://localhost:8080",
		});

		expect(WebSocket).toHaveBeenCalledWith("ws://localhost:8080");
		expect(isConnecting.value).toBe(true);
	});

	it("should handle WebSocket open event", () => {
		const { isConnected, isConnecting } = useWebSocket({
			url: "ws://localhost:8080",
		});

		mockWebSocket.onopen();

		expect(isConnected.value).toBe(true);
		expect(isConnecting.value).toBe(false);
	});

	it("should handle WebSocket message event", () => {
		const { lastMessage, messageHistory } = useWebSocket({
			url: "ws://localhost:8080",
		});

		const mockEvent = {
			data: '{"type": "chat", "message": "Hello"}',
		};

		mockWebSocket.onmessage(mockEvent);

		expect(lastMessage.value).toMatchObject({
			data: { type: "chat", message: "Hello" },
			timestamp: expect.any(Number),
			id: expect.stringMatching(/^msg-\d+-[a-z0-9]+$/),
		});
		expect(messageHistory.value).toHaveLength(1);
	});

	it("should handle plain text message", () => {
		const { lastMessage } = useWebSocket({
			url: "ws://localhost:8080",
		});

		const mockEvent = {
			data: "plain text message",
		};

		mockWebSocket.onmessage(mockEvent);

		expect(lastMessage.value?.data).toBe("plain text message");
	});

	it("should limit message history to 100 messages", () => {
		const { messageHistory } = useWebSocket({
			url: "ws://localhost:8080",
		});

		// Simulate 101 messages
		for (let i = 0; i < 101; i++) {
			mockWebSocket.onmessage({ data: `message ${i}` });
		}

		expect(messageHistory.value).toHaveLength(100);
		expect(messageHistory.value[0]?.data).toBe("message 1"); // First message should be removed
	});

	it("should handle WebSocket close event", () => {
		const { isConnected, isConnecting, reconnectAttempts } = useWebSocket({
			url: "ws://localhost:8080",
			reconnectInterval: 1000,
			maxReconnectAttempts: 3,
		});

		// First connect
		mockWebSocket.onopen();
		expect(isConnected.value).toBe(true);

		// Close connection
		mockWebSocket.readyState = WebSocket.CLOSED;
		mockWebSocket.onclose({ wasClean: false });

		expect(isConnected.value).toBe(false);
		expect(isConnecting.value).toBe(false);

		// Should schedule reconnect
		vi.advanceTimersByTime(1000);
		expect(WebSocket).toHaveBeenCalledTimes(2);
		expect(reconnectAttempts.value).toBe(1);
	});

	it("should not reconnect on clean close", () => {
		const { reconnectAttempts } = useWebSocket({
			url: "ws://localhost:8080",
			reconnectInterval: 1000,
		});

		mockWebSocket.onclose({ wasClean: true });

		vi.advanceTimersByTime(2000);
		expect(WebSocket).toHaveBeenCalledTimes(1); // Only initial connection
		expect(reconnectAttempts.value).toBe(0);
	});

	it("should stop reconnecting after max attempts", () => {
		const { error, reconnectAttempts } = useWebSocket({
			url: "ws://localhost:8080",
			reconnectInterval: 1000,
			maxReconnectAttempts: 2,
		});

		// Simulate failed connections
		for (let i = 0; i < 3; i++) {
			mockWebSocket.onclose({ wasClean: false });
			vi.advanceTimersByTime(1000);
		}

		expect(reconnectAttempts.value).toBe(2);
		expect(error.value).toBe("Maximum reconnection attempts reached");
	});

	it("should handle WebSocket error", () => {
		const { error, isConnecting } = useWebSocket({
			url: "ws://localhost:8080",
		});

		mockWebSocket.onerror();

		expect(error.value).toBe("WebSocket error occurred");
		expect(isConnecting.value).toBe(false);
	});

	it("should send message", () => {
		const { send, isConnected } = useWebSocket({
			url: "ws://localhost:8080",
		});

		mockWebSocket.onopen();
		expect(isConnected.value).toBe(true);

		const result = send("test message");
		expect(result).toBe(true);
		expect(mockWebSocket.send).toHaveBeenCalledWith("test message");
	});

	it("should send JSON message", () => {
		const { sendJSON } = useWebSocket({
			url: "ws://localhost:8080",
		});

		mockWebSocket.onopen();

		const data = { type: "test", value: 123 };
		const result = sendJSON(data);

		expect(result).toBe(true);
		expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(data));
	});

	it("should fail to send when not connected", () => {
		const { send } = useWebSocket({
			url: "ws://localhost:8080",
		});

		const result = send("test message");
		expect(result).toBe(false);
		expect(mockWebSocket.send).not.toHaveBeenCalled();
	});

	it("should disconnect manually", () => {
		const { disconnect, isConnected, isConnecting } = useWebSocket({
			url: "ws://localhost:8080",
		});

		mockWebSocket.onopen();
		expect(isConnected.value).toBe(true);

		disconnect();

		expect(mockWebSocket.close).toHaveBeenCalled();
		expect(isConnected.value).toBe(false);
		expect(isConnecting.value).toBe(false);
	});

	it("should reconnect manually", () => {
		const { reconnect, reconnectAttempts } = useWebSocket({
			url: "ws://localhost:8080",
		});

		// Simulate some reconnection attempts
		mockWebSocket.onclose({ wasClean: false });
		vi.advanceTimersByTime(3000);
		expect(reconnectAttempts.value).toBe(1);

		reconnect();

		expect(reconnectAttempts.value).toBe(0);
		expect(mockWebSocket.close).toHaveBeenCalled();
	});

	it("should clear message history", () => {
		const { clearHistory, lastMessage, messageHistory } = useWebSocket({
			url: "ws://localhost:8080",
		});

		// Add some messages
		mockWebSocket.onmessage({ data: "message 1" });
		mockWebSocket.onmessage({ data: "message 2" });

		expect(messageHistory.value).toHaveLength(2);
		expect(lastMessage.value).toBeTruthy();

		clearHistory();

		expect(messageHistory.value).toEqual([]);
		expect(lastMessage.value).toBe(null);
	});

	it("should get message by ID", () => {
		const { getMessageById, messageHistory } = useWebSocket({
			url: "ws://localhost:8080",
		});

		mockWebSocket.onmessage({ data: "test message" });
		const messageId = messageHistory.value[0]?.id;

		const foundMessage = getMessageById(messageId!);
		expect(foundMessage).toBe(messageHistory.value[0]);

		const notFound = getMessageById("non-existent");
		expect(notFound).toBeUndefined();
	});

	it("should get messages by type", () => {
		const { getMessagesByType } = useWebSocket({
			url: "ws://localhost:8080",
		});

		mockWebSocket.onmessage({ data: '{"type": "chat", "message": "hello"}' });
		mockWebSocket.onmessage({
			data: '{"type": "notification", "message": "alert"}',
		});
		mockWebSocket.onmessage({ data: '{"type": "chat", "message": "world"}' });

		const chatMessages = getMessagesByType("chat");
		expect(chatMessages).toHaveLength(2);
		expect(chatMessages[0]?.data.type).toBe("chat");

		const notificationMessages = getMessagesByType("notification");
		expect(notificationMessages).toHaveLength(1);
	});

	it("should get messages in time range", () => {
		const { getMessagesInTimeRange } = useWebSocket({
			url: "ws://localhost:8080",
		});

		mockWebSocket.onmessage({ data: "message 1" });
		vi.advanceTimersByTime(1000);
		const _midTime = Date.now();

		mockWebSocket.onmessage({ data: "message 2" });
		vi.advanceTimersByTime(1000);

		mockWebSocket.onmessage({ data: "message 3" });

		const rangeMessages = getMessagesInTimeRange(
			_midTime - 500,
			_midTime + 500,
		);
		expect(rangeMessages).toHaveLength(1);
		expect(rangeMessages[0]?.data).toBe("message 2");
	});

	it("should use custom protocols", () => {
		useWebSocket({
			url: "ws://localhost:8080",
			protocols: ["chat", "notification"],
		});

		expect(WebSocket).toHaveBeenCalledWith("ws://localhost:8080", [
			"chat",
			"notification",
		]);
	});

	it("should handle heartbeat", () => {
		useWebSocket({
			url: "ws://localhost:8080",
			heartbeat: {
				interval: 1000,
				message: "ping",
			},
		});

		mockWebSocket.onopen();

		// Clear initial send calls
		mockWebSocket.send.mockClear();

		vi.advanceTimersByTime(1000);
		expect(mockWebSocket.send).toHaveBeenCalledWith("ping");

		vi.advanceTimersByTime(1000);
		expect(mockWebSocket.send).toHaveBeenCalledTimes(2);
	});

	it("should stop heartbeat on disconnect", () => {
		const { disconnect } = useWebSocket({
			url: "ws://localhost:8080",
			heartbeat: {
				interval: 1000,
				message: "ping",
			},
		});

		mockWebSocket.onopen();
		disconnect();

		mockWebSocket.send.mockClear();
		vi.advanceTimersByTime(2000);
		expect(mockWebSocket.send).not.toHaveBeenCalled();
	});

	it("should handle connection errors", () => {
		vi.mocked(WebSocket).mockImplementation(() => {
			throw new Error("Connection failed");
		});

		const { error, isConnecting } = useWebSocket({
			url: "ws://localhost:8080",
		});

		expect(error.value).toBe("Connection failed");
		expect(isConnecting.value).toBe(false);
	});

	it("should not connect if already connecting or connected", () => {
		const { connect } = useWebSocket({
			url: "ws://localhost:8080",
		});

		const initialCallCount = (WebSocket as any).mock.calls.length;

		// Try to connect while connecting
		connect();
		expect((WebSocket as any).mock.calls.length).toBe(initialCallCount);

		// Simulate connection established
		mockWebSocket.readyState = WebSocket.OPEN;
		connect();
		expect((WebSocket as any).mock.calls.length).toBe(initialCallCount);
	});
});
