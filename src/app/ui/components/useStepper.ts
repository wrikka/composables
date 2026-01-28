import { ref, computed } from 'vue';

export interface UseStepperOptions {
  defaultIndex?: number;
  totalSteps?: number;
  linear?: boolean;
  clickable?: boolean;
}

export function useStepper(options: UseStepperOptions = {}) {
  const currentIndex = ref(options.defaultIndex || 0);
  const totalSteps = ref(options.totalSteps || 0);

  const isFirst = computed(() => currentIndex.value === 0);
  const isLast = computed(() => currentIndex.value === totalSteps.value - 1);
  const canGoNext = computed(() => currentIndex.value < totalSteps.value - 1);
  const canGoPrevious = computed(() => currentIndex.value > 0);

  function next() {
    if (canGoNext.value) {
      currentIndex.value++;
    }
  }

  function previous() {
    if (canGoPrevious.value) {
      currentIndex.value--;
    }
  }

  function goTo(index: number) {
    if (index >= 0 && index < totalSteps.value) {
      currentIndex.value = index;
    }
  }

  function first() {
    currentIndex.value = 0;
  }

  function last() {
    currentIndex.value = totalSteps.value - 1;
  }

  function reset() {
    currentIndex.value = options.defaultIndex || 0;
  }

  function setTotalSteps(count: number) {
    totalSteps.value = count;
  }

  function setCurrentIndex(index: number) {
    if (index >= 0 && index < totalSteps.value) {
      currentIndex.value = index;
    }
  }

  const progress = computed(() => {
    if (totalSteps.value === 0) return 0;
    return ((currentIndex.value + 1) / totalSteps.value) * 100;
  });

  return {
    currentIndex,
    totalSteps,
    isFirst,
    isLast,
    canGoNext,
    canGoPrevious,
    next,
    previous,
    goTo,
    first,
    last,
    reset,
    setTotalSteps,
    setCurrentIndex,
    progress,
  };
}
