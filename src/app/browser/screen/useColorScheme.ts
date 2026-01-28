import { onMounted, onUnmounted, ref } from 'vue';

export type ColorScheme = 'light' | 'dark' | 'no-preference';

export function useColorScheme() {
  const scheme = ref<ColorScheme>('no-preference');
  const isDark = ref(false);
  const isLight = ref(false);

  function update() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      scheme.value = 'dark';
      isDark.value = true;
      isLight.value = false;
    }
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      scheme.value = 'light';
      isDark.value = false;
      isLight.value = true;
    }
    else {
      scheme.value = 'no-preference';
      isDark.value = false;
      isLight.value = false;
    }
  }

  onMounted(() => {
    update();

    if (window.matchMedia) {
      const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const lightQuery = window.matchMedia('(prefers-color-scheme: light)');

      darkQuery.addEventListener('change', update);
      lightQuery.addEventListener('change', update);
    }
  });

  onUnmounted(() => {
    if (window.matchMedia) {
      const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const lightQuery = window.matchMedia('(prefers-color-scheme: light)');

      darkQuery.removeEventListener('change', update);
      lightQuery.removeEventListener('change', update);
    }
  });

  return {
    scheme,
    isDark,
    isLight,
    update,
  };
}
