import { onMounted, onUnmounted, ref, type Ref } from 'vue';

export function useScrollLock(
  locked: Ref<boolean> | boolean = true,
  options: {
    target?: HTMLElement;
  } = {},
) {
  const isLocked = ref(locked);
  const { target = document.body } = options;
  let originalOverflow = '';

  function lock() {
    originalOverflow = target.style.overflow;
    target.style.overflow = 'hidden';
    isLocked.value = true;
  }

  function unlock() {
    target.style.overflow = originalOverflow;
    isLocked.value = false;
  }

  function toggle() {
    if (isLocked.value) {
      unlock();
    }
    else {
      lock();
    }
  }

  onMounted(() => {
    if (typeof locked === 'boolean' ? locked : locked.value) {
      lock();
    }
  });

  onUnmounted(() => {
    unlock();
  });

  return {
    isLocked,
    lock,
    unlock,
    toggle,
  };
}
