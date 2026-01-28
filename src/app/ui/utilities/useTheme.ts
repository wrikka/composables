import { ref, watch } from 'vue';

export type Theme = 'light' | 'dark' | 'system';

export interface UseThemeOptions {
  defaultTheme?: Theme;
  storageKey?: string;
  storage?: Storage;
}

export function useTheme(options: UseThemeOptions = {}) {
  const {
    defaultTheme = 'system',
    storageKey = 'theme',
    storage = localStorage,
  } = options;

  const theme = ref<Theme>(defaultTheme);
  const isDark = ref(false);

  function getSystemTheme(): Theme {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function getActualTheme(): Theme {
    if (theme.value === 'system') {
      return getSystemTheme();
    }
    return theme.value;
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme;
    updateIsDark();
    saveTheme();
  }

  function toggleTheme() {
    const newTheme: Theme = theme.value === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }

  function updateIsDark() {
    isDark.value = getActualTheme() === 'dark';
  }

  function saveTheme() {
    try {
      storage.setItem(storageKey, theme.value);
    }
    catch (e) {
      console.error('Failed to save theme:', e);
    }
  }

  function loadTheme() {
    try {
      const savedTheme = storage.getItem(storageKey);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        theme.value = savedTheme as Theme;
      }
    }
    catch (e) {
      console.error('Failed to load theme:', e);
    }
  }

  function watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (theme.value === 'system') {
          updateIsDark();
        }
      });
    }
  }

  watch(theme, () => {
    updateIsDark();
    saveTheme();
  });

  loadTheme();
  watchSystemTheme();

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    getActualTheme,
  };
}
