import { computed, ref } from "vue";

export interface HealthCheck {
  name: string;
  status: "healthy" | "unhealthy" | "degraded";
  message?: string;
  responseTime?: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface HealthCheckConfig {
  interval?: number;
  timeout?: number;
  retries?: number;
  enableAutoCheck?: boolean;
  enableDetailedInfo?: boolean;
}

export interface UseHealthCheckOptions extends HealthCheckConfig {
  checks?: Array<{
    name: string;
    check: () => Promise<boolean>;
    timeout?: number;
    critical?: boolean;
  }>;
}

export function useHealthCheck(options: UseHealthCheckOptions = {}) {
  const {
    interval = 30000, // 30 seconds
    timeout = 5000,
    retries = 3,
    enableAutoCheck = true,
    enableDetailedInfo = true,
    checks = [],
  } = options;

  const healthChecks = ref<HealthCheck[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const isLoading = computed(() => loading.value);
  const lastError = computed(() => error.value);
  const overallStatus = computed(() => {
    if (healthChecks.value.length === 0) return "healthy";

    const hasUnhealthy = healthChecks.value.some(check => check.status === "unhealthy");
    const hasDegraded = healthChecks.value.some(check => check.status === "degraded");

    if (hasUnhealthy) return "unhealthy";
    if (hasDegraded) return "degraded";
    return "healthy";
  });
  const isHealthy = computed(() => overallStatus.value === "healthy");
  const isDegraded = computed(() => overallStatus.value === "degraded");
  const isUnhealthy = computed(() => overallStatus.value === "unhealthy");

  let checkTimer: NodeJS.Timeout | null = null;

  // Run individual health check
  const runCheck = async (checkConfig: any): Promise<HealthCheck> => {
    const startTime = Date.now();
    const checkTimeout = checkConfig.timeout || timeout;

    try {
      const result = await Promise.race([
        checkConfig.check(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Health check timeout")), checkTimeout)),
      ]);

      return {
        name: checkConfig.name,
        status: result ? "healthy" : "unhealthy",
        responseTime: Date.now() - startTime,
        timestamp: Date.now(),
        metadata: {
          timeout: checkTimeout,
          critical: checkConfig.critical || false,
        },
      };
    } catch (err) {
      return {
        name: checkConfig.name,
        status: "unhealthy",
        message: err instanceof Error ? err.message : String(err),
        responseTime: Date.now() - startTime,
        timestamp: Date.now(),
        metadata: {
          timeout: checkTimeout,
          critical: checkConfig.critical || false,
          error: err instanceof Error ? err.stack : String(err),
        },
      };
    }
  };

  // Run all health checks
  const runAllChecks = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const checkPromises = checks.map(check => runCheck(check));
      const results = await Promise.all(checkPromises);

      healthChecks.value = results;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  // Run health check with retries
  const runCheckWithRetries = async (checkConfig: any): Promise<HealthCheck> => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await runCheck(checkConfig);

        // If check is healthy or this is the last attempt, return result
        if (result.status === "healthy" || attempt === retries) {
          return result;
        }

        lastError = new Error(`Health check failed on attempt ${attempt}`);

        // Wait before retry
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        if (attempt === retries) {
          throw lastError;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw lastError || new Error("Health check failed");
  };

  // Add health check
  const addCheck = (checkConfig: {
    name: string;
    check: () => Promise<boolean>;
    timeout?: number;
    critical?: boolean;
  }): void => {
    checks.push(checkConfig);

    // Run the new check immediately
    if (enableAutoCheck) {
      runCheckWithRetries(checkConfig).then(result => {
        const existingIndex = healthChecks.value.findIndex(c => c.name === result.name);
        if (existingIndex >= 0) {
          healthChecks.value[existingIndex] = result;
        } else {
          healthChecks.value.push(result);
        }
      }).catch(() => {
        // Error handled in runCheckWithRetries
      });
    }
  };

  // Remove health check
  const removeCheck = (name: string): void => {
    const index = checks.findIndex(check => check.name === name);
    if (index >= 0) {
      checks.splice(index, 1);
    }

    const healthIndex = healthChecks.value.findIndex(check => check.name === name);
    if (healthIndex >= 0) {
      healthChecks.value.splice(healthIndex, 1);
    }
  };

  // Get health check by name
  const getCheck = (name: string): HealthCheck | undefined => {
    return healthChecks.value.find(check => check.name === name);
  };

  // Get critical checks
  const getCriticalChecks = (): HealthCheck[] => {
    return healthChecks.value.filter(check => check.metadata?.["critical"]);
  };

  // Get unhealthy checks
  const getUnhealthyChecks = (): HealthCheck[] => {
    return healthChecks.value.filter(check => check.status === "unhealthy");
  };

  // Get degraded checks
  const getDegradedChecks = (): HealthCheck[] => {
    return healthChecks.value.filter(check => check.status === "degraded");
  };

  // Get health summary
  const getHealthSummary = () => {
    const summary = {
      status: overallStatus.value,
      total: healthChecks.value.length,
      healthy: healthChecks.value.filter(c => c.status === "healthy").length,
      degraded: healthChecks.value.filter(c => c.status === "degraded").length,
      unhealthy: healthChecks.value.filter(c => c.status === "unhealthy").length,
      critical: getCriticalChecks().length,
      lastChecked: healthChecks.value.length > 0
        ? Math.max(...healthChecks.value.map(c => c.timestamp))
        : null,
      checks: healthChecks.value,
    };

    if (enableDetailedInfo) {
      return {
        ...summary,
        averageResponseTime: healthChecks.value.length > 0
          ? healthChecks.value.reduce((sum, c) => sum + (c.responseTime || 0), 0) / healthChecks.value.length
          : 0,
        slowestCheck: healthChecks.value.length > 0
          ? healthChecks.value.reduce((slowest, c) => (c.responseTime || 0) > (slowest.responseTime || 0) ? c : slowest)
          : null,
        fastestCheck: healthChecks.value.length > 0
          ? healthChecks.value.reduce((fastest, c) =>
            (c.responseTime || 0) < (fastest.responseTime || Infinity) ? c : fastest
          )
          : null,
      };
    }

    return summary;
  };

  // Setup auto-check
  const setupAutoCheck = (): void => {
    if (checkTimer) {
      clearInterval(checkTimer);
    }

    if (enableAutoCheck && interval > 0) {
      checkTimer = setInterval(() => {
        runAllChecks();
      }, interval);
    }
  };

  // Stop auto-check
  const stopAutoCheck = (): void => {
    if (checkTimer) {
      clearInterval(checkTimer);
      checkTimer = null;
    }
  };

  // Clear all checks
  const clear = (): void => {
    healthChecks.value = [];
    stopAutoCheck();
  };

  // Initialize
  if (checks.length > 0) {
    runAllChecks();
    setupAutoCheck();
  }

  return {
    // State
    healthChecks,
    overallStatus,
    isHealthy,
    isDegraded,
    isUnhealthy,
    loading: isLoading,
    error: lastError,

    // Actions
    runAllChecks,
    runCheck,
    addCheck,
    removeCheck,
    clear,

    // Utilities
    getCheck,
    getCriticalChecks,
    getUnhealthyChecks,
    getDegradedChecks,
    getHealthSummary,

    // Configuration
    setupAutoCheck,
    stopAutoCheck,
  };
}

// Express middleware for health endpoint
export function createHealthMiddleware(healthCheck: ReturnType<typeof useHealthCheck>) {
  return async (req: any, res: any, next: any) => {
    if (req.path === "/health" || req.path === "/healthz") {
      try {
        await healthCheck.runAllChecks();
        const summary = healthCheck.getHealthSummary();

        const statusCode = summary.status === "healthy"
          ? 200
          : summary.status === "degraded"
          ? 200
          : 503;

        res.status(statusCode).json(summary);
      } catch (err) {
        res.status(503).json({
          status: "unhealthy",
          error: err instanceof Error ? err.message : "Health check failed",
        });
      }
    } else {
      next();
    }
  };
}
