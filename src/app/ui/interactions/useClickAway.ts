import { onMounted, onUnmounted, Ref } from 'vue';

export function useClickAway(
  target: Ref<HTMLElement | null> | HTMLElement | null,
  callback: (e: MouseEvent) => void,
  options: {
    ignore?: Ref<HTMLElement | null> | HTMLElement | null | Ref<HTMLElement | null>[];
  } = {},
) {
  const {
    ignore = [],
  } = options;

  function handleClick(e: MouseEvent) {
    const targets = Array.isArray(ignore) ? ignore : [ignore];

    if (target && 'value' in target) {
      const element = target.value;
      if (element && element.contains(e.target as Node)) {
        return;
      }
    }
    else if (target && target instanceof HTMLElement) {
      if (target.contains(e.target as Node)) {
        return;
      }
    }

    for (const ignoreTarget of targets) {
      if (ignoreTarget && 'value' in ignoreTarget) {
        const element = ignoreTarget.value;
        if (element && element.contains(e.target as Node)) {
          return;
        }
      }
      else if (ignoreTarget && ignoreTarget instanceof HTMLElement) {
        if (ignoreTarget.contains(e.target as Node)) {
          return;
        }
      }
    }

    callback(e);
  }

  onMounted(() => {
    document.addEventListener('click', handleClick, true);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClick, true);
  });
}
