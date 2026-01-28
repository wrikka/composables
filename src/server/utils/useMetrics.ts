import { computed, ref } from "vue";

export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string> | undefined;
  unit: string | undefined;
}

export interface MetricAggregation {
  name: string;
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  timestamp: number;
  tags: Record<string, string> | undefined;
}

export interface MetricsConfig {
  enableConsole?: boolean;
  enableRemote?: boolean;
  remoteEndpoint?: string;
  bufferSize?: number;
  flushInterval?: number;
  aggregationWindow?: number;
  enableAggregations?: boolean;
}

export interface UseMetricsOptions extends MetricsConfig {
  defaultTags?: Record<string, string>;
}

export function useMetrics(options: UseMetricsOptions = {}) {
  const {
    enableConsole = false,
    enableRemote = false,
    remoteEndpoint,
    bufferSize = 1000,
    flushInterval = 10000,
    aggregationWindow = 60000, // 1 minute
    enableAggregations = true,
    defaultTags = {},
  } = options;

  const metrics = ref<Metric[]>([]);
  const aggregations = ref<Map<string, MetricAggregation[]>>(new Map());
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const isLoading = computed(() => loading.value);
  const lastError = computed(() => error.value);
  const metricCount = computed(() => metrics.value.length);

  let flushTimer: NodeJS.Timeout | null = null;
  let aggregationTimer: NodeJS.Timeout | null = null;

  // Create metric
  const createMetric = (
    name: string,
    value: number,
    tags?: Record<string, string>,
    unit?: string,
  ): Metric => {
    return {
      name,
      value,
      timestamp: Date.now(),
      tags: { ...defaultTags, ...(tags ?? {}) },
      unit: unit ?? undefined,
    };
  };

  // Add metric
  const addMetric = (metric: Metric): void => {
    metrics.value.push(metric);

    // Console output
    if (enableConsole) {
      console.log(`[METRIC] ${metric.name}: ${metric.value}${metric.unit ? ` ${metric.unit}` : ""}`, metric.tags);
    }

    // Check buffer size
    if (metrics.value.length >= bufferSize) {
      flushMetrics();
    }
  };

  // Record metric
  const record = (
    name: string,
    value: number,
    tags?: Record<string, string>,
    unit?: string,
  ): void => {
    const metric = createMetric(name, value, tags, unit);
    addMetric(metric);
  };

  // Increment counter
  const increment = (
    name: string,
    value: number = 1,
    tags?: Record<string, string>,
  ): void => {
    record(name, value, tags, "count");
  };

  // Record timing
  const timing = (
    name: string,
    duration: number,
    tags?: Record<string, string>,
  ): void => {
    record(name, duration, tags, "ms");
  };

  // Record gauge
  const gauge = (
    name: string,
    value: number,
    tags?: Record<string, string>,
  ): void => {
    record(name, value, tags, "value");
  };

  // Record histogram
  const histogram = (
    name: string,
    value: number,
    tags?: Record<string, string>,
  ): void => {
    record(name, value, tags, "value");
  };

  // Get metrics by name
  const getMetricsByName = (name: string): Metric[] => {
    return metrics.value.filter(metric => metric.name === name);
  };

  // Get metrics by tags
  const getMetricsByTags = (tags: Record<string, string>): Metric[] => {
    return metrics.value.filter(metric => {
      if (!metric.tags) return false;

      return Object.entries(tags).every(([key, value]) => metric.tags![key] === value);
    });
  };

  // Get metrics in time range
  const getMetricsByTimeRange = (startTime: number, endTime: number): Metric[] => {
    return metrics.value.filter(metric => metric.timestamp >= startTime && metric.timestamp <= endTime);
  };

  // Calculate aggregations
  const calculateAggregations = (): void => {
    if (!enableAggregations) return;

    const now = Date.now();
    const windowStart = now - aggregationWindow;

    // Group metrics by name and tags
    const groupedMetrics = new Map<string, Metric[]>();

    metrics.value.forEach(metric => {
      if (metric.timestamp < windowStart) return;

      const key = `${metric.name}:${JSON.stringify(metric.tags || {})}`;

      if (!groupedMetrics.has(key)) {
        groupedMetrics.set(key, []);
      }

      groupedMetrics.get(key)!.push(metric);
    });

    // Calculate aggregations for each group
    const newAggregations = new Map<string, MetricAggregation[]>();

    groupedMetrics.forEach((groupMetrics, key) => {
      if (groupMetrics.length === 0) return;

      const values = groupMetrics.map(m => m.value);
      const aggregation: MetricAggregation = {
        name: groupMetrics[0]?.name || "",
        count: values.length,
        sum: values.reduce((sum, val) => sum + val, 0),
        min: values.length > 0 ? Math.min(...values) : 0,
        max: values.length > 0 ? Math.max(...values) : 0,
        avg: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
        timestamp: now,
        tags: groupMetrics[0]?.tags,
      };

      if (!newAggregations.has(key)) {
        newAggregations.set(key, []);
      }

      const aggList = newAggregations.get(key);
      if (aggList) {
        aggList.push(aggregation);
      }
    });

    aggregations.value = newAggregations;
  };

  // Get aggregations
  const getAggregations = (name: string, tags?: Record<string, string>): MetricAggregation[] => {
    const key = `${name}:${JSON.stringify(tags || {})}`;
    return aggregations.value.get(key) || [];
  };

  // Get latest aggregation
  const getLatestAggregation = (name: string, tags?: Record<string, string>): MetricAggregation | null => {
    const aggregationList = getAggregations(name, tags);
    return aggregationList.length > 0 ? aggregationList[aggregationList.length - 1] ?? null : null;
  };

  // Flush metrics
  const flushMetrics = async (): Promise<void> => {
    if (metrics.value.length === 0) return;

    const metricsToFlush = [...metrics.value];
    metrics.value = [];

    try {
      // Send to remote endpoint
      if (enableRemote && remoteEndpoint) {
        await fetch(remoteEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            metrics: metricsToFlush,
            aggregations: Array.from(aggregations.value.values()).flat(),
          }),
        });
      }

      // Console output
      if (enableConsole) {
        console.log(`[METRICS] Flushed ${metricsToFlush.length} metrics`);
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    }
  };

  // Clear metrics
  const clear = (): void => {
    metrics.value = [];
    aggregations.value.clear();
  };

  // Export metrics
  const exportMetrics = (format: "json" | "csv" = "json"): string => {
    if (format === "json") {
      return JSON.stringify(metrics.value, null, 2);
    } else {
      // CSV format
      const headers = ["timestamp", "name", "value", "unit", "tags"];
      const csvData = metrics.value.map(metric => [
        new Date(metric.timestamp).toISOString(),
        metric.name,
        metric.value.toString(),
        metric.unit || "",
        JSON.stringify(metric.tags || {}),
      ]);

      return [headers, ...csvData].map(row => row.join(",")).join("\n");
    }
  };

  // Get summary statistics
  const getSummary = () => {
    const summary: Record<string, any> = {};

    // Count metrics by name
    const nameCounts = new Map<string, number>();
    metrics.value.forEach(metric => {
      nameCounts.set(metric.name, (nameCounts.get(metric.name) || 0) + 1);
    });

    Object.entries(nameCounts).forEach(([name, count]) => {
      const nameMetrics = getMetricsByName(name);
      const values = nameMetrics.map(m => m.value);

      summary[name] = {
        count,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, val) => sum + val, 0) / values.length,
        latest: nameMetrics[nameMetrics.length - 1],
      };
    });

    return summary;
  };

  // Setup auto-flush
  const setupAutoFlush = (): void => {
    if (flushTimer) {
      clearInterval(flushTimer);
    }

    if (flushInterval > 0) {
      flushTimer = setInterval(() => {
        flushMetrics();
      }, flushInterval);
    }
  };

  // Setup aggregation timer
  const setupAggregationTimer = (): void => {
    if (aggregationTimer) {
      clearInterval(aggregationTimer);
    }

    if (enableAggregations && aggregationWindow > 0) {
      aggregationTimer = setInterval(() => {
        calculateAggregations();
      }, aggregationWindow / 10); // Update every 10% of window
    }
  };

  // Stop timers
  const stopTimers = (): void => {
    if (flushTimer) {
      clearInterval(flushTimer);
      flushTimer = null;
    }

    if (aggregationTimer) {
      clearInterval(aggregationTimer);
      aggregationTimer = null;
    }
  };

  // Initialize
  setupAutoFlush();
  setupAggregationTimer();

  return {
    // State
    metrics,
    aggregations,
    metricCount,
    loading: isLoading,
    error: lastError,

    // Recording methods
    record,
    increment,
    timing,
    gauge,
    histogram,

    // Query methods
    getMetricsByName,
    getMetricsByTags,
    getMetricsByTimeRange,
    getAggregations,
    getLatestAggregation,
    getSummary,

    // Actions
    flushMetrics,
    clear,
    exportMetrics,

    // Configuration
    setupAutoFlush,
    setupAggregationTimer,
    stopTimers,
  };
}

// Performance monitoring helper
export function usePerformanceMonitoring(metrics: ReturnType<typeof useMetrics>) {
  const timers = ref<Map<string, number>>(new Map());

  // Start timer
  const startTimer = (name: string): void => {
    timers.value.set(name, performance.now());
  };

  // End timer and record timing
  const endTimer = (name: string, tags?: Record<string, string>): number => {
    const startTime = timers.value.get(name);
    if (!startTime) {
      console.warn(`Timer '${name}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    metrics.timing(name, duration, tags);

    timers.value.delete(name);
    return duration;
  };

  // Measure function execution time
  const measure = async <T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>,
  ): Promise<T> => {
    startTimer(name);
    try {
      const result = await fn();
      endTimer(name, tags);
      return result;
    } catch (error) {
      endTimer(name, { ...tags, error: "true" });
      throw error;
    }
  };

  // Measure synchronous function
  const measureSync = <T>(
    name: string,
    fn: () => T,
    tags?: Record<string, string>,
  ): T => {
    startTimer(name);
    try {
      const result = fn();
      endTimer(name, tags);
      return result;
    } catch (error) {
      endTimer(name, { ...tags, error: "true" });
      throw error;
    }
  };

  return {
    startTimer,
    endTimer,
    measure,
    measureSync,
  };
}
