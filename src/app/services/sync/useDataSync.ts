import { computed, onUnmounted, ref } from "vue";

interface SyncOptions {
  url: string;
  interval?: number;
  reconnectInterval?: number;
  maxRetries?: number;
  onMessage?: (data: any) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface SyncState {
  isConnected: boolean;
  isConnecting: boolean;
  lastSync: number | null;
  error: Error | null;
}

export function useDataSync<T = any>(options: SyncOptions) {
  const {
    url,
    interval = 30000,
    reconnectInterval = 5000,
    maxRetries = 5,
    onMessage,
    onError,
    onConnect,
    onDisconnect,
  } = options;

  const state = ref<SyncState>({
    isConnected: false,
    isConnecting: false,
    lastSync: null,
    error: null,
  });

  const data = ref<T | null>(null);
  const socket = ref<WebSocket | null>(null);
  const retryCount = ref(0);
  const intervalId = ref<number | null>(null);

  const connect = () => {
    if (state.value.isConnecting || state.value.isConnected) return;

    state.value.isConnecting = true;
    state.value.error = null;

    try {
      socket.value = new WebSocket(url);

      socket.value.onopen = () => {
        state.value.isConnected = true;
        state.value.isConnecting = false;
        state.value.lastSync = Date.now();
        retryCount.value = 0;
        onConnect?.();
      };

      socket.value.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          data.value = parsed;
          state.value.lastSync = Date.now();
          onMessage?.(parsed);
        } catch (error) {
          state.value.error = error as Error;
          onError?.(error as Error);
        }
      };

      socket.value.onerror = (_event) => {
        const error = new Error("WebSocket error");
        state.value.error = error;
        onError?.(error);
      };

      socket.value.onclose = () => {
        state.value.isConnected = false;
        state.value.isConnecting = false;
        onDisconnect?.();

        if (retryCount.value < maxRetries) {
          retryCount.value++;
          setTimeout(connect, reconnectInterval);
        }
      };
    } catch (error) {
      state.value.isConnecting = false;
      state.value.error = error as Error;
      onError?.(error as Error);
    }
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.close();
      socket.value = null;
    }
    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
    state.value.isConnected = false;
    state.value.isConnecting = false;
  };

  const send = (message: any) => {
    if (socket.value && state.value.isConnected) {
      try {
        socket.value.send(JSON.stringify(message));
      } catch (error) {
        state.value.error = error as Error;
        onError?.(error as Error);
      }
    }
  };

  const reconnect = () => {
    disconnect();
    retryCount.value = 0;
    connect();
  };

  const startPolling = () => {
    if (intervalId.value) return;

    intervalId.value = window.setInterval(async () => {
      if (!state.value.isConnected) {
        connect();
      }
    }, interval);
  };

  const stopPolling = () => {
    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
  };

  const isConnected = computed(() => state.value.isConnected);
  const isConnecting = computed(() => state.value.isConnecting);
  const lastSync = computed(() => state.value.lastSync);
  const error = computed(() => state.value.error);

  onUnmounted(() => {
    disconnect();
  });

  return {
    data,
    state,
    isConnected,
    isConnecting,
    lastSync,
    error,
    connect,
    disconnect,
    send,
    reconnect,
    startPolling,
    stopPolling,
  };
}
