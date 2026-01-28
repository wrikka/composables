import { onMounted, onUnmounted, ref } from 'vue';

export function usePixelRatio() {
  const pixelRatio = ref(window.devicePixelRatio || 1);

  function update() {
    pixelRatio.value = window.devicePixelRatio || 1;
  }

  onMounted(() => {
    window.addEventListener('resize', update);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', update);
  });

  return {
    pixelRatio,
    update,
  };
}
