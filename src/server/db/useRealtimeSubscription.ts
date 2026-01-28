import { computed, onUnmounted, ref } from "vue";

export interface RealtimeSubscriptionOptions {
  table: string;
  filter?: Record<string, any>;
  events?: ("INSERT" | "UPDATE" | "DELETE")[];
  batchSize?: number;
  debounceMs?: number;
}

export interface RealtimeEvent<T = any> {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  data: T;
  oldData?: T;
  timestamp: number;
  id: string;
}

export interface RealtimeSubscription<T = any> {
  id: string;
  options: RealtimeSubscriptionOptions;
  isActive: boolean;
  unsubscribe: () => void;
  onData: (event: RealtimeEvent<T>) => void;
  onError: (error: Error) => void;
}

export interface RealtimeConnection {
  subscribe: <T = any>(options: RealtimeSubscriptionOptions) => Promise<RealtimeSubscription<T>>;
  unsubscribe: (subscriptionId: string) => Promise<void>;
  unsubscribeAll: () => Promise<void>;
  close: () => Promise<void>;
}

export function useRealtimeSubscription<T = any>(
  connection: RealtimeConnection,
  options: RealtimeSubscriptionOptions,
) {
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const data = ref<T[]>([]);
  const events = ref<RealtimeEvent<T>[]>([]);
  const subscription = ref<RealtimeSubscription<T> | null>(null);
  const isActive = ref(false);

  const isLoading = computed(() => loading.value);
  const lastError = computed(() => error.value);
  const isConnected = computed(() => isActive.value);
  const latestData = computed(() => data.value);
  const eventHistory = computed(() => events.value);

  let eventBuffer: RealtimeEvent<T>[] = [];
  let debounceTimer: NodeJS.Timeout | null = null;

  const processEvent = (event: RealtimeEvent<T>): void => {
    const { debounceMs = 100 } = options;

    if (debounceMs > 0) {
      eventBuffer.push(event);

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        const bufferedEvents = [...eventBuffer];
        eventBuffer = [];

        bufferedEvents.forEach(processSingleEvent);
      }, debounceMs);
    } else {
      processSingleEvent(event);
    }
  };

  const processSingleEvent = (event: RealtimeEvent<T>): void => {
    events.value = [...events.value, event] as RealtimeEvent<T>[];

    switch (event.type) {
      case "INSERT":
        data.value = [...data.value, event.data] as T[];
        break;

      case "UPDATE":
        data.value = data.value.map(item => {
          // This would need a proper ID comparison in real implementation
          if (JSON.stringify(item) === JSON.stringify(event.oldData)) {
            return event.data as T;
          }
          return item;
        }) as T[];
        break;

      case "DELETE":
        data.value = data.value.filter(item => {
          // This would need a proper ID comparison in real implementation
          return JSON.stringify(item) !== JSON.stringify(event.data);
        }) as T[];
        break;
    }
  };

  const subscribe = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const sub = await connection.subscribe<T>(options);

      sub.onData = (event: RealtimeEvent<T>) => {
        processEvent(event);
      };

      sub.onError = (err: Error) => {
        error.value = err;
      };

      subscription.value = sub;
      isActive.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const unsubscribe = async (): Promise<void> => {
    if (subscription.value) {
      await subscription.value.unsubscribe();
      subscription.value = null;
      isActive.value = false;
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    eventBuffer = [];
  };

  const pause = (): void => {
    if (subscription.value) {
      subscription.value.isActive = false;
    }
  };

  const resume = (): void => {
    if (subscription.value) {
      subscription.value.isActive = true;
    }
  };

  const clearData = (): void => {
    data.value = [];
    events.value = [];
  };

  const clearHistory = (): void => {
    events.value = [];
  };

  const getLastEvent = (type?: "INSERT" | "UPDATE" | "DELETE"): RealtimeEvent<T> | null => {
    const filteredEvents = type
      ? events.value.filter(event => event.type === type)
      : events.value;

    return filteredEvents.length > 0 ? filteredEvents[filteredEvents.length - 1] as RealtimeEvent<T> : null;
  };

  const getEventCount = (type?: "INSERT" | "UPDATE" | "DELETE"): number => {
    return type
      ? events.value.filter(event => event.type === type).length
      : events.value.length;
  };

  const reset = (): void => {
    unsubscribe();
    clearData();
    loading.value = false;
    error.value = null;
  };

  // Auto-cleanup on unmount
  if (typeof onUnmounted === "function") {
    onUnmounted(reset);
  }

  return {
    // State
    data: latestData,
    events: eventHistory,
    loading: isLoading,
    error: lastError,
    isConnected,

    // Actions
    subscribe,
    unsubscribe,
    pause,
    resume,
    clearData,
    clearHistory,

    // Utilities
    getLastEvent,
    getEventCount,
    reset,
  };
}

export function useRealtimeDatabase() {
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const connected = ref(false);
  const subscriptions = ref<Map<string, RealtimeSubscription>>(new Map());
  const connection = ref<RealtimeConnection | null>(null);

  const isLoading = computed(() => loading.value);
  const lastError = computed(() => error.value);
  const isConnected = computed(() => connected.value);
  const subscriptionCount = computed(() => subscriptions.value.size);

  const connect = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      // This would typically connect to a real-time database like Supabase, Firebase, etc.
      // For now, we'll create a mock implementation
      const mockConnection: RealtimeConnection = {
        subscribe: async <T = any>(options: RealtimeSubscriptionOptions) => {
          const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          console.log("Realtime Subscription created:", subscriptionId, options);

          const subscription: RealtimeSubscription<T> = {
            id: subscriptionId,
            options,
            isActive: true,
            unsubscribe: async () => {
              console.log("Realtime Subscription unsubscribed:", subscriptionId);
            },
            onData: () => {},
            onError: () => {},
          };

          // Mock real-time events
          const mockEvent = () => {
            if (subscription.isActive && subscription.onData) {
              const mockData = { id: Math.random().toString(36), timestamp: Date.now() };
              subscription.onData({
                type: "INSERT",
                table: options.table,
                data: mockData as T,
                timestamp: Date.now(),
                id: `event_${Date.now()}`,
              });
            }
          };

          // Simulate events every 2 seconds
          const interval = setInterval(mockEvent, 2000);

          subscription.unsubscribe = async () => {
            clearInterval(interval);
            console.log("Realtime Subscription unsubscribed:", subscriptionId);
          };

          return subscription;
        },

        unsubscribe: async (subscriptionId: string) => {
          console.log("Realtime Unsubscribe:", subscriptionId);
        },

        unsubscribeAll: async () => {
          console.log("Realtime Unsubscribe all");
        },

        close: async () => {
          console.log("Realtime Connection closed");
        },
      };

      connection.value = mockConnection;
      connected.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      connected.value = false;
    } finally {
      loading.value = false;
    }
  };

  const disconnect = async (): Promise<void> => {
    if (connection.value) {
      await connection.value.close();
      connection.value = null;
      connected.value = false;
      subscriptions.value.clear();
    }
  };

  const subscribe = <T = any>(options: RealtimeSubscriptionOptions): Promise<RealtimeSubscription<T>> => {
    if (!connection.value || !connected.value) {
      throw new Error("Not connected to real-time database");
    }

    return connection.value.subscribe<T>(options);
  };

  const unsubscribe = async (subscriptionId: string): Promise<void> => {
    if (connection.value) {
      await connection.value.unsubscribe(subscriptionId);
      subscriptions.value.delete(subscriptionId);
    }
  };

  const unsubscribeAll = async (): Promise<void> => {
    if (connection.value) {
      await connection.value.unsubscribeAll();
      subscriptions.value.clear();
    }
  };

  const getSubscription = (subscriptionId: string): RealtimeSubscription | undefined => {
    return subscriptions.value.get(subscriptionId);
  };

  const getActiveSubscriptions = (): RealtimeSubscription[] => {
    return Array.from(subscriptions.value.values()).filter(sub => sub.isActive);
  };

  const reset = (): void => {
    disconnect();
    loading.value = false;
    error.value = null;
  };

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    unsubscribeAll,
    getSubscription,
    getActiveSubscriptions,
    reset,
    loading: isLoading,
    error: lastError,
    isConnected,
    subscriptionCount,
  };
}
