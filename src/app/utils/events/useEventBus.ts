import { computed, readonly, type Ref, ref } from "vue";

export interface EventBusEvent {
  type: string;
  payload?: any;
  timestamp?: number;
}

export interface EventBusOptions {
  maxEvents?: number;
  enableHistory?: boolean;
}

export function useEventBus(options: EventBusOptions = {}) {
  const {
    maxEvents = 100,
    enableHistory = false,
  } = options;

  const events = ref<EventBusEvent[]>([]);
  const listeners = ref<Map<string, Set<Function>>>(new Map());

  const eventCount = computed(() => events.value.length);
  const hasEvents = computed(() => events.value.length > 0);

  const emit = (type: string, payload?: any) => {
    const event: EventBusEvent = {
      type,
      payload,
      timestamp: Date.now(),
    };

    // Add to history if enabled
    if (enableHistory) {
      events.value.push(event);

      // Limit history size
      if (events.value.length > maxEvents) {
        events.value.shift();
      }
    }

    // Notify listeners
    const typeListeners = listeners.value.get(type);
    if (typeListeners) {
      typeListeners.forEach(listener => listener(event));
    }

    // Notify global listeners
    const globalListeners = listeners.value.get("*");
    if (globalListeners) {
      globalListeners.forEach(listener => listener(event));
    }
  };

  const on = (type: string, listener: Function) => {
    if (!listeners.value.has(type)) {
      listeners.value.set(type, new Set());
    }
    listeners.value.get(type)!.add(listener);

    // Return unsubscribe function
    return () => {
      const typeListeners = listeners.value.get(type);
      if (typeListeners) {
        typeListeners.delete(listener);
        if (typeListeners.size === 0) {
          listeners.value.delete(type);
        }
      }
    };
  };

  const once = (type: string, listener: Function) => {
    const unsubscribe = on(type, (event: EventBusEvent) => {
      listener(event);
      unsubscribe();
    });
    return unsubscribe;
  };

  const off = (type?: string, listener?: Function) => {
    if (!type) {
      // Remove all listeners
      listeners.value.clear();
      return;
    }

    if (!listener) {
      // Remove all listeners for this type
      listeners.value.delete(type);
      return;
    }

    // Remove specific listener
    const typeListeners = listeners.value.get(type);
    if (typeListeners) {
      typeListeners.delete(listener);
      if (typeListeners.size === 0) {
        listeners.value.delete(type);
      }
    }
  };

  const clear = () => {
    events.value = [];
    listeners.value.clear();
  };

  const getEvents = (type?: string) => {
    if (!type) return events.value;
    return events.value.filter(event => event.type === type);
  };

  const getLastEvent = (type?: string) => {
    const filtered = getEvents(type);
    return filtered[filtered.length - 1];
  };

  return {
    events: readonly(events) as Ref<ReadonlyArray<EventBusEvent>>,
    eventCount,
    hasEvents,
    emit,
    on,
    once,
    off,
    clear,
    getEvents,
    getLastEvent,
  };
}
