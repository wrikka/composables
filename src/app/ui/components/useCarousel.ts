import { ref, computed, onMounted, onUnmounted } from 'vue';

export interface UseCarouselOptions {
  autoplay?: boolean;
  autoplayInterval?: number;
  loop?: boolean;
  defaultIndex?: number;
}

export function useCarousel<T>(items: T[], options: UseCarouselOptions = {}) {
  const currentIndex = ref(options.defaultIndex || 0);
  const isPlaying = ref(options.autoplay ?? false);
  const isPaused = ref(false);

  const {
    autoplayInterval = 3000,
    loop = true,
  } = options;

  let autoplayTimer: any = null;

  const currentItem = computed(() => items[currentIndex.value] || null);
  const isFirst = computed(() => currentIndex.value === 0);
  const isLast = computed(() => currentIndex.value === items.length - 1);
  const canGoNext = computed(() => loop || !isLast.value);
  const canGoPrevious = computed(() => loop || !isFirst.value);

  function next() {
    if (canGoNext.value) {
      currentIndex.value = (currentIndex.value + 1) % items.length;
    }
  }

  function previous() {
    if (canGoPrevious.value) {
      currentIndex.value = currentIndex.value === 0 ? items.length - 1 : currentIndex.value - 1;
    }
  }

  function goTo(index: number) {
    if (index >= 0 && index < items.length) {
      currentIndex.value = index;
    }
  }

  function first() {
    currentIndex.value = 0;
  }

  function last() {
    currentIndex.value = items.length - 1;
  }

  function play() {
    isPlaying.value = true;
    isPaused.value = false;
    startAutoplay();
  }

  function pause() {
    isPlaying.value = false;
    isPaused.value = true;
    stopAutoplay();
  }

  function stop() {
    isPlaying.value = false;
    isPaused.value = false;
    stopAutoplay();
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      next();
    }, autoplayInterval);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function reset() {
    currentIndex.value = options.defaultIndex || 0;
    stop();
  }

  onMounted(() => {
    if (options.autoplay) {
      play();
    }
  });

  onUnmounted(() => {
    stop();
  });

  return {
    currentIndex,
    currentItem,
    isFirst,
    isLast,
    canGoNext,
    canGoPrevious,
    isPlaying,
    isPaused,
    next,
    previous,
    goTo,
    first,
    last,
    play,
    pause,
    stop,
    reset,
  };
}
