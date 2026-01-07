import { onUnmounted, watch, unref, type Ref } from 'vue';

export type EventTargetRef = Ref<EventTarget | null | undefined> | EventTarget | null;

export function useEventListener(
  target: EventTargetRef,
  event: string,
  listener: EventListener,
  options?: boolean | AddEventListenerOptions
) {
  let cleanup = () => {};

  const stopWatch = watch(
    () => unref(target),
    (el) => {
      cleanup();
      if (!el) return;

      el.addEventListener(event, listener, options);

      cleanup = () => {
        el.removeEventListener(event, listener, options);
        cleanup = () => {};
      };
    },
    { immediate: true, flush: 'post' }
  );

  const stop = () => {
    stopWatch();
    cleanup();
  };

  onUnmounted(stop);

  return stop;
}

