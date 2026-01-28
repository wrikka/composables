import { ref, watch } from 'vue';

export type ColorMode = 'light' | 'dark' | 'auto';

export interface UseColorModeOptions {
  defaultColorMode?: ColorMode;
  storageKey?: string;
  storage?: Storage;
}

export function useColorMode(options: UseColorModeOptions = {}) {
  const {
    defaultColorMode = 'auto',
    storageKey = 'colorMode',
    storage = localStorage,
  } = options;

  const colorMode = ref<ColorMode>(defaultColorMode);
  const isDark = ref(false);

  function getSystemColorMode(): ColorMode {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function getActualColorMode(): ColorMode {
    if (colorMode.value === 'auto') {
      return getSystemColorMode();
    }
    return colorMode.value;
  }

  function setColorMode(newColorMode: ColorMode) {
    colorMode.value = newColorMode;
    updateIsDark();
    saveColorMode();
  }

  function toggleColorMode() {
    const newColorMode: ColorMode = colorMode.value === 'light' ? 'dark' : 'light';
    setColorMode(newColorMode);
  }

  function updateIsDark() {
    isDark.value = getActualColorMode() === 'dark';
  }

  function saveColorMode() {
    try {
      storage.setItem(storageKey, colorMode.value);
    }
    catch (e) {
      console.error('Failed to save color mode:', e);
    }
  }

  function loadColorMode() {
    try {
      const savedColorMode = storage.getItem(storageKey);
      if (savedColorMode && ['light', 'dark', 'auto'].includes(savedColorMode)) {
        colorMode.value = savedColorMode as ColorMode;
      }
    }
    catch (e) {
      console.error('Failed to load color mode:', e);
    }
  }

  function watchSystemColorMode() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (colorMode.value === 'auto') {
          updateIsDark();
        }
      });
    }
  }

  watch(colorMode, () => {
    updateIsDark();
    saveColorMode();
  });

  loadColorMode();
  watchSystemColorMode();

  return {
    colorMode,
    isDark,
    setColorMode,
    toggleColorMode,
    getActualColorMode,
  };
}
