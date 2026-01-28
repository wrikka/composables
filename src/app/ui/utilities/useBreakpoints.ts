import { ref, computed, onMounted, onUnmounted } from 'vue';

export interface Breakpoint {
  name: string;
  min: number;
  max?: number;
}

export interface UseBreakpointsOptions {
  breakpoints?: Breakpoint[];
  defaultBreakpoint?: string;
}

export function useBreakpoints(options: UseBreakpointsOptions = {}) {
  const currentBreakpoint = ref<string>(options.defaultBreakpoint || 'xs');
  const windowWidth = ref(0);

  const defaultBreakpoints: Breakpoint[] = [
    { name: 'xs', min: 0, max: 639 },
    { name: 'sm', min: 640, max: 767 },
    { name: 'md', min: 768, max: 1023 },
    { name: 'lg', min: 1024, max: 1279 },
    { name: 'xl', min: 1280, max: 1535 },
    { name: '2xl', min: 1536 },
  ];

  const breakpoints = options.breakpoints || defaultBreakpoints;

  const isXs = computed(() => currentBreakpoint.value === 'xs');
  const isSm = computed(() => currentBreakpoint.value === 'sm');
  const isMd = computed(() => currentBreakpoint.value === 'md');
  const isLg = computed(() => currentBreakpoint.value === 'lg');
  const isXl = computed(() => currentBreakpoint.value === 'xl');
  const is2xl = computed(() => currentBreakpoint.value === '2xl');

  const isSmAndUp = computed(() => breakpoints.findIndex(b => b.name === currentBreakpoint.value) >= breakpoints.findIndex(b => b.name === 'sm'));
  const isMdAndUp = computed(() => breakpoints.findIndex(b => b.name === currentBreakpoint.value) >= breakpoints.findIndex(b => b.name === 'md'));
  const isLgAndUp = computed(() => breakpoints.findIndex(b => b.name === currentBreakpoint.value) >= breakpoints.findIndex(b => b.name === 'lg'));
  const isXlAndUp = computed(() => breakpoints.findIndex(b => b.name === currentBreakpoint.value) >= breakpoints.findIndex(b => b.name === 'xl'));

  const isSmAndDown = computed(() => breakpoints.findIndex(b => b.name === currentBreakpoint.value) <= breakpoints.findIndex(b => b.name === 'sm'));
  const isMdAndDown = computed(() => breakpoints.findIndex(b => b.name === currentBreakpoint.value) <= breakpoints.findIndex(b => b.name === 'md'));
  const isLgAndDown = computed(() => breakpoints.findIndex(b => b.name === currentBreakpoint.value) <= breakpoints.findIndex(b => b.name === 'lg'));
  const isXlAndDown = computed(() => breakpoints.findIndex(b => b.name === currentBreakpoint.value) <= breakpoints.findIndex(b => b.name === 'xl'));

  function updateBreakpoint() {
    windowWidth.value = window.innerWidth;

    for (let i = breakpoints.length - 1; i >= 0; i--) {
      const breakpoint = breakpoints[i];
      if (breakpoint && windowWidth.value >= breakpoint.min) {
        if (!breakpoint.max || windowWidth.value <= breakpoint.max) {
          currentBreakpoint.value = breakpoint.name;
          break;
        }
      }
    }
  }

  function matches(breakpointName: string): boolean {
    return currentBreakpoint.value === breakpointName;
  }

  function greaterOrEqual(breakpointName: string): boolean {
    const currentIndex = breakpoints.findIndex(b => b.name === currentBreakpoint.value);
    const targetIndex = breakpoints.findIndex(b => b.name === breakpointName);
    return currentIndex >= targetIndex;
  }

  function lessOrEqual(breakpointName: string): boolean {
    const currentIndex = breakpoints.findIndex(b => b.name === currentBreakpoint.value);
    const targetIndex = breakpoints.findIndex(b => b.name === breakpointName);
    return currentIndex <= targetIndex;
  }

  function between(minBreakpoint: string, maxBreakpoint: string): boolean {
    return greaterOrEqual(minBreakpoint) && lessOrEqual(maxBreakpoint);
  }

  onMounted(() => {
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateBreakpoint);
  });

  return {
    currentBreakpoint,
    windowWidth,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    isSmAndUp,
    isMdAndUp,
    isLgAndUp,
    isXlAndUp,
    isSmAndDown,
    isMdAndDown,
    isLgAndDown,
    isXlAndDown,
    matches,
    greaterOrEqual,
    lessOrEqual,
    between,
  };
}
