import { ref } from 'vue';

export interface PerformanceMetrics {
  navigationTiming: PerformanceNavigationTiming | null;
  paintTiming: {
    firstPaint: number | null;
    firstContentfulPaint: number | null;
  };
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
}

export function usePerformance() {
  const metrics = ref<PerformanceMetrics>({
    navigationTiming: null,
    paintTiming: {
      firstPaint: null,
      firstContentfulPaint: null,
    },
    memory: null,
  });

  function getNavigationTiming() {
    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return timing;
  }

  function getPaintTiming() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')?.startTime || null;
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || null;
    return { firstPaint, firstContentfulPaint };
  }

  function getMemory() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  function measure(name: string) {
    performance.mark(`${name}-start`);
    return () => {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      const measure = performance.getEntriesByName(name)[0];
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
      return measure.duration;
    };
  }

  function update() {
    metrics.value = {
      navigationTiming: getNavigationTiming(),
      paintTiming: getPaintTiming(),
      memory: getMemory(),
    };
  }

  update();

  return {
    metrics,
    getNavigationTiming,
    getPaintTiming,
    getMemory,
    measure,
    update,
  };
}
