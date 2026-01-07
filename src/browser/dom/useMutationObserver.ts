import { onUnmounted, watch, unref, type Ref } from 'vue';

export type ElementTarget = Ref<Element | null | undefined> | Element | null;

export function useMutationObserver(
  target: ElementTarget,
  callback: MutationCallback,
  options: MutationObserverInit = {}
) {
  let observer: MutationObserver | undefined;

  const stop = () => {
    if (observer) {
      observer.disconnect();
      observer = undefined;
    }
  };

  const stopWatch = watch(
    () => unref(target),
    (el) => {
      stop();
      if (el) {
        observer = new MutationObserver(callback);
        observer.observe(el, options);
      }
    },
    { immediate: true, flush: 'post' }
  );

  onUnmounted(() => {
    stop();
    stopWatch();
  });

  return {
    stop,
  };
}

