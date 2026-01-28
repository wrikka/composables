import { computed, onMounted, onUnmounted, readonly, type Ref, ref } from "vue";

export interface StorageEventMessage {
  key: string;
  newValue: any;
  oldValue: any;
  storageArea: "localStorage" | "sessionStorage";
  timestamp: number;
}

export interface UseStorageEventsOptions {
  storageArea?: "localStorage" | "sessionStorage";
  enableHistory?: boolean;
  maxHistory?: number;
  keys?: string[];
}

export function useStorageEvents(options: UseStorageEventsOptions = {}) {
  const {
    storageArea = "localStorage",
    enableHistory = false,
    maxHistory = 100,
    keys = [], // Empty array means listen to all keys
  } = options;

  const events = ref<StorageEventMessage[]>([]);
  const isSupported = ref(false);
  const error = ref<Error | null>(null);

  const eventCount = computed(() => events.value.length);
  const lastEvent = computed(() => events.value[events.value.length - 1] || null);

  const handleStorageChange = (event: StorageEvent) => {
    // Check if we should listen to this key
    if (keys.length > 0 && !keys.includes(event.key || "")) {
      return;
    }

    const message: StorageEventMessage = {
      key: event.key || "",
      newValue: event.newValue ? JSON.parse(event.newValue) : null,
      oldValue: event.oldValue ? JSON.parse(event.oldValue) : null,
      storageArea,
      timestamp: Date.now(),
    };

    if (enableHistory) {
      events.value.push(message);

      if (events.value.length > maxHistory) {
        events.value.shift();
      }
    }

    // Emit custom event for reactive updates
    window.dispatchEvent(new CustomEvent("storage-change", { detail: message }));
  };

  const startListening = () => {
    try {
      if (typeof window === "undefined" || !window.addEventListener) {
        throw new Error("Storage events are not supported in this environment");
      }

      isSupported.value = true;
      window.addEventListener("storage", handleStorageChange);
    } catch (err) {
      error.value = err as Error;
      isSupported.value = false;
    }
  };

  const stopListening = () => {
    if (typeof window !== "undefined" && window.removeEventListener) {
      window.removeEventListener("storage", handleStorageChange);
    }
  };

  const clear = () => {
    events.value = [];
  };

  const getEvents = (key?: string) => {
    if (!key) return events.value;
    return events.value.filter(event => event.key === key);
  };

  const getLastEvent = (key?: string) => {
    const filtered = getEvents(key);
    return filtered[filtered.length - 1];
  };

  // Auto-start listening on mount
  onMounted(() => {
    startListening();
  });

  // Auto-cleanup on unmount
  onUnmounted(() => {
    stopListening();
  });

  return {
    events: readonly(events) as Ref<ReadonlyArray<StorageEventMessage>>,
    isSupported: readonly(isSupported) as Ref<boolean>,
    error: readonly(error) as Ref<Error | null>,
    eventCount,
    lastEvent,
    startListening,
    stopListening,
    clear,
    getEvents,
    getLastEvent,
  };
}
