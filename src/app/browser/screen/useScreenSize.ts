import { onMounted, onUnmounted, ref } from 'vue';

export interface ScreenSize {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
}

export function useScreenSize() {
  const width = ref(window.screen.width);
  const height = ref(window.screen.height);
  const availWidth = ref(window.screen.availWidth);
  const availHeight = ref(window.screen.availHeight);

  const size = ref<ScreenSize>({
    width: width.value,
    height: height.value,
    availWidth: availWidth.value,
    availHeight: availHeight.value,
  });

  function update() {
    width.value = window.screen.width;
    height.value = window.screen.height;
    availWidth.value = window.screen.availWidth;
    availHeight.value = window.screen.availHeight;

    size.value = {
      width: width.value,
      height: height.value,
      availWidth: availWidth.value,
      availHeight: availHeight.value,
    };
  }

  onMounted(() => {
    window.addEventListener('resize', update);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', update);
  });

  return {
    width,
    height,
    availWidth,
    availHeight,
    size,
    update,
  };
}
