import { onMounted, onUnmounted, ref } from "vue";

export interface WebSocketOptions {
	url: string;
	protocols?: string | string[];
	reconnectInterval?: number;
	maxReconnectAttempts?: number;
	heartbeat?: {
		interval: number;
		message: string | object;
	};
}

export interface WebSocketMessage {
	data: any;
	timestamp: number;
	id: string;
}

export function useWebSocket(options: WebSocketOptions) {
	const {
		url,
		protocols,
		reconnectInterval = 3000,
		maxReconnectAttempts = 5,
		heartbeat,
	} = options;

	const isConnected = ref(false);
	const isConnecting = ref(false);
	const error = ref<string | null>(null);
	const lastMessage = ref<WebSocketMessage | null>(null);
	const messageHistory = ref<WebSocketMessage[]>([]);
	const reconnectAttempts = ref(0);

	let websocket: WebSocket | null = null;
	let heartbeatInterval: number | null = null;
	let reconnectTimeout: number | null = null;

	const generateMessageId = () =>
		`msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	const connect = () => {
		if (
			websocket &&
			(websocket.readyState === WebSocket.CONNECTING ||
				websocket.readyState === WebSocket.OPEN)
		) {
			return;
		}

		isConnecting.value = true;
		error.value = null;

		try {
			websocket = protocols
				? new WebSocket(url, protocols)
				: new WebSocket(url);

			websocket.onopen = () => {
				isConnected.value = true;
				isConnecting.value = false;
				reconnectAttempts.value = 0;
				error.value = null;

				if (heartbeat) {
					startHeartbeat();
				}
			};

			websocket.onmessage = (event) => {
				let data: any;

				try {
					data = JSON.parse(event.data);
				} catch {
					data = event.data;
				}

				const message: WebSocketMessage = {
					data,
					timestamp: Date.now(),
					id: generateMessageId(),
				};

				lastMessage.value = message;
				messageHistory.value.push(message);

				// Limit history to last 100 messages
				if (messageHistory.value.length > 100) {
					messageHistory.value.shift();
				}
			};

			websocket.onclose = (event) => {
				isConnected.value = false;
				isConnecting.value = false;
				stopHeartbeat();

				if (!event.wasClean && reconnectAttempts.value < maxReconnectAttempts) {
					scheduleReconnect();
				} else if (reconnectAttempts.value >= maxReconnectAttempts) {
					error.value = "Maximum reconnection attempts reached";
				}
			};

			websocket.onerror = () => {
				error.value = "WebSocket error occurred";
				isConnecting.value = false;
			};
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to connect";
			isConnecting.value = false;
		}
	};

	const disconnect = () => {
		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}

		if (websocket) {
			websocket.close();
			websocket = null;
		}

		isConnected.value = false;
		isConnecting.value = false;
		stopHeartbeat();
	};

	const scheduleReconnect = () => {
		reconnectAttempts.value++;

		reconnectTimeout = setTimeout(() => {
			connect();
		}, reconnectInterval) as unknown as number;
	};

	const send = (data: string | object) => {
		if (websocket && websocket.readyState === WebSocket.OPEN) {
			const message = typeof data === "string" ? data : JSON.stringify(data);
			websocket.send(message);
			return true;
		}
		return false;
	};

	const sendJSON = (data: object) => {
		return send(JSON.stringify(data));
	};

	const startHeartbeat = () => {
		if (!heartbeat) return;

		heartbeatInterval = setInterval(() => {
			send(heartbeat.message);
		}, heartbeat.interval) as unknown as number;
	};

	const stopHeartbeat = () => {
		if (heartbeatInterval) {
			clearInterval(heartbeatInterval);
			heartbeatInterval = null;
		}
	};

	const clearHistory = () => {
		messageHistory.value = [];
		lastMessage.value = null;
	};

	const getMessageById = (id: string): WebSocketMessage | undefined => {
		return messageHistory.value.find((msg) => msg.id === id);
	};

	const getMessagesByType = (type: string): WebSocketMessage[] => {
		return messageHistory.value.filter(
			(msg) => typeof msg.data === "object" && msg.data.type === type,
		);
	};

	const getMessagesInTimeRange = (
		startTime: number,
		endTime: number,
	): WebSocketMessage[] => {
		return messageHistory.value.filter(
			(msg) => msg.timestamp >= startTime && msg.timestamp <= endTime,
		);
	};

	const reconnect = () => {
		disconnect();
		reconnectAttempts.value = 0;
		connect();
	};

	onMounted(() => {
		connect();
	});

	onUnmounted(() => {
		disconnect();
	});

	return {
		isConnected,
		isConnecting,
		error,
		lastMessage,
		messageHistory,
		reconnectAttempts,
		connect,
		disconnect,
		send,
		sendJSON,
		reconnect,
		clearHistory,
		getMessageById,
		getMessagesByType,
		getMessagesInTimeRange,
	};
}
