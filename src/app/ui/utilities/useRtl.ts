import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

export interface UseRtlOptions {
  defaultRtl?: boolean;
  storageKey?: string;
  storage?: Storage;
}

export function useRtl(options: UseRtlOptions = {}) {
  const {
    defaultRtl = false,
    storageKey = 'rtl',
    storage = localStorage,
  } = options;

  const isRtl = ref(defaultRtl);
  const isLtr = computed(() => !isRtl.value);
  const direction = computed(() => (isRtl.value ? 'rtl' : 'ltr'));

  function setRtl(value: boolean) {
    isRtl.value = value;
    saveRtl();
  }

  function toggle() {
    isRtl.value = !isRtl.value;
    saveRtl();
  }

  function saveRtl() {
    try {
      storage.setItem(storageKey, String(isRtl.value));
    }
    catch (e) {
      console.error('Failed to save RTL setting:', e);
    }
  }

  function loadRtl() {
    try {
      const savedRtl = storage.getItem(storageKey);
      if (savedRtl !== null) {
        isRtl.value = savedRtl === 'true';
      }
    }
    catch (e) {
      console.error('Failed to load RTL setting:', e);
    }
  }

  function detectFromDocument() {
    const htmlElement = document.documentElement;
    const dir = htmlElement.getAttribute('dir');
    if (dir === 'rtl') {
      isRtl.value = true;
    }
    else if (dir === 'ltr') {
      isRtl.value = false;
    }
  }

  function updateDocument() {
    document.documentElement.setAttribute('dir', direction.value);
  }

  onMounted(() => {
    loadRtl();
    detectFromDocument();
    updateDocument();
  });

  watch(isRtl, () => {
    updateDocument();
  });

  onUnmounted(() => {
    document.documentElement.setAttribute('dir', 'ltr');
  });

  return {
    isRtl,
    isLtr,
    direction,
    setRtl,
    toggle,
    detectFromDocument,
  };
}
