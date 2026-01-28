import { computed, ref } from "vue";

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun: number | undefined;
  nextRun: number | undefined;
  running: boolean;
  handler: () => Promise<void>;
  metadata: Record<string, any> | undefined;
}

export interface CronJobResult {
  id: string;
  name: string;
  success: boolean;
  startTime: number;
  endTime: number;
  duration: number;
  error: Error | undefined;
  output: any | undefined;
}

export interface UseCronOptions {
  timezone?: string;
  enableLogging?: boolean;
  maxConcurrentJobs?: number;
  defaultTimeout?: number;
}

export function useCron(options: UseCronOptions = {}) {
  const {
    timezone: _timezone = "UTC",
    enableLogging = true,
    maxConcurrentJobs = 5,
    defaultTimeout = 300000, // 5 minutes
  } = options;

  const jobs = ref<Map<string, CronJob>>(new Map());
  const jobHistory = ref<Map<string, CronJobResult[]>>(new Map());
  const runningJobs = ref<Set<string>>(new Set());
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const isLoading = computed(() => loading.value);
  const lastError = computed(() => error.value);
  const jobCount = computed(() => jobs.value.size);
  const runningCount = computed(() => runningJobs.value.size);

  // Simple cron parser (supports basic patterns)
  const parseCronSchedule = (
    schedule: string,
  ): { minute: number; hour: number; day: number; month: number; weekday: number } => {
    const parts = schedule.split(" ");
    if (parts.length !== 5) {
      throw new Error("Invalid cron schedule format");
    }

    return {
      minute: parts[0] === "*" ? -1 : parseInt(parts[0] || "0"),
      hour: parts[1] === "*" ? -1 : parseInt(parts[1] || "0"),
      day: parts[2] === "*" ? -1 : parseInt(parts[2] || "0"),
      month: parts[3] === "*" ? -1 : parseInt(parts[3] || "0"),
      weekday: parts[4] === "*" ? -1 : parseInt(parts[4] || "0"),
    };
  };

  // Calculate next run time
  const calculateNextRun = (schedule: string, fromTime: number = Date.now()): number => {
    const parsed = parseCronSchedule(schedule);
    const date = new Date(fromTime);

    // Simple implementation - add 1 minute for '*' values
    if (parsed.minute === -1) {
      date.setMinutes(date.getMinutes() + 1);
    } else {
      date.setMinutes(parsed.minute);
    }

    if (parsed.hour !== -1) {
      date.setHours(parsed.hour);
    }

    // Ensure next run is in the future
    if (date.getTime() <= fromTime) {
      date.setTime(date.getTime() + 60000); // Add 1 minute
    }

    return date.getTime();
  };

  // Log job execution
  const logJob = (message: string, data?: any): void => {
    if (enableLogging) {
      console.log(`[CRON] ${message}`, data);
    }
  };

  // Execute job
  const executeJob = async (job: CronJob): Promise<CronJobResult> => {
    const startTime = Date.now();
    let success = false;
    let error: Error | undefined;
    let output: any;

    logJob(`Starting job: ${job.name}`, { id: job.id });

    try {
      // Set timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Job timeout")), defaultTimeout);
      });

      // Execute job
      const jobPromise = job.handler();
      output = await Promise.race([jobPromise, timeoutPromise]);
      success = true;

      logJob(`Job completed: ${job.name}`, { duration: Date.now() - startTime });
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      success = false;

      logJob(`Job failed: ${job.name}`, {
        error: error.message,
        duration: Date.now() - startTime,
      });
    }

    const endTime = Date.now();
    const result: CronJobResult = {
      id: job.id,
      name: job.name,
      success,
      startTime,
      endTime,
      duration: endTime - startTime,
      error,
      output,
    };

    // Store result in history
    if (!jobHistory.value.has(job.id)) {
      jobHistory.value.set(job.id, []);
    }

    const history = jobHistory.value.get(job.id)!;
    history.push(result);

    // Keep only last 10 results
    if (history.length > 10) {
      history.shift();
    }

    return result;
  };

  // Add job
  const addJob = (jobConfig: {
    name: string;
    schedule: string;
    handler: () => Promise<void>;
    enabled?: boolean;
    metadata?: Record<string, any>;
  }): string => {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job: CronJob = {
      id,
      name: jobConfig.name,
      schedule: jobConfig.schedule,
      enabled: jobConfig.enabled ?? true,
      lastRun: undefined,
      nextRun: calculateNextRun(jobConfig.schedule),
      running: false,
      handler: jobConfig.handler,
      metadata: jobConfig.metadata,
    };

    jobs.value.set(id, job);
    logJob(`Job added: ${job.name}`, { id, schedule: job.schedule });

    return id;
  };

  // Remove job
  const removeJob = (id: string): boolean => {
    const job = jobs.value.get(id);
    if (!job) return false;

    // Don't remove if currently running
    if (job.running) {
      throw new Error("Cannot remove running job");
    }

    jobs.value.delete(id);
    jobHistory.value.delete(id);
    logJob(`Job removed: ${job.name}`, { id });

    return true;
  };

  // Enable/disable job
  const toggleJob = (id: string, enabled: boolean): boolean => {
    const job = jobs.value.get(id);
    if (!job) return false;

    job.enabled = enabled;

    if (enabled) {
      job.nextRun = calculateNextRun(job.schedule);
      logJob(`Job enabled: ${job.name}`, { id });
    } else {
      job.nextRun = undefined;
      logJob(`Job disabled: ${job.name}`, { id });
    }

    return true;
  };

  // Run job manually
  const runJob = async (id: string): Promise<CronJobResult> => {
    const job = jobs.value.get(id);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.running) {
      throw new Error("Job is already running");
    }

    if (runningJobs.value.size >= maxConcurrentJobs) {
      throw new Error("Maximum concurrent jobs reached");
    }

    job.running = true;
    job.lastRun = Date.now();
    runningJobs.value.add(id);

    try {
      const result = await executeJob(job);
      return result;
    } finally {
      job.running = false;
      runningJobs.value.delete(id);

      // Calculate next run
      if (job.enabled) {
        job.nextRun = calculateNextRun(job.schedule, Date.now());
      }
    }
  };

  // Get job by ID
  const getJob = (id: string): CronJob | undefined => {
    return jobs.value.get(id);
  };

  // Get all jobs
  const getAllJobs = (): CronJob[] => {
    return Array.from(jobs.value.values());
  };

  // Get enabled jobs
  const getEnabledJobs = (): CronJob[] => {
    return Array.from(jobs.value.values()).filter(job => job.enabled);
  };

  // Get running jobs
  const getRunningJobs = (): CronJob[] => {
    return Array.from(jobs.value.values()).filter(job => job.running);
  };

  // Get job history
  const getJobHistory = (id: string, limit: number = 10): CronJobResult[] => {
    const history = jobHistory.value.get(id) || [];
    return history.slice(-limit);
  };

  // Get jobs that should run now
  const getJobsToRun = (): CronJob[] => {
    const now = Date.now();
    return Array.from(jobs.value.values()).filter(job =>
      job.enabled
      && !job.running
      && job.nextRun
      && job.nextRun <= now
    );
  };

  // Run all pending jobs
  const runPendingJobs = async (): Promise<CronJobResult[]> => {
    const jobsToRun = getJobsToRun();
    const results: CronJobResult[] = [];

    for (const job of jobsToRun) {
      if (runningJobs.value.size >= maxConcurrentJobs) {
        logJob("Max concurrent jobs reached, skipping remaining jobs");
        break;
      }

      try {
        const result = await runJob(job.id);
        results.push(result);
      } catch (err) {
        logJob(`Failed to run job: ${job.name}`, { error: err });
      }
    }

    return results;
  };

  // Schedule checker
  const startScheduler = (): void => {
    const checkInterval = 60000; // Check every minute

    setInterval(async () => {
      if (loading.value) return;

      try {
        await runPendingJobs();
      } catch (err) {
        error.value = err instanceof Error ? err : new Error(String(err));
      }
    }, checkInterval);
  };

  // Clear all jobs
  const clear = (): void => {
    jobs.value.clear();
    jobHistory.value.clear();
    runningJobs.value.clear();
  };

  // Get scheduler stats
  const getStats = () => {
    const now = Date.now();
    const allJobs = Array.from(jobs.value.values());

    return {
      total: allJobs.length,
      enabled: allJobs.filter(job => job.enabled).length,
      disabled: allJobs.filter(job => !job.enabled).length,
      running: runningJobs.value.size,
      nextRun: allJobs
        .filter(job => job.enabled && job.nextRun)
        .map(job => ({
          name: job.name,
          nextRun: job.nextRun!,
          timeUntilRun: job.nextRun! - now,
        }))
        .sort((a, b) => a.timeUntilRun - b.timeUntilRun),
    };
  };

  // Initialize scheduler
  startScheduler();

  return {
    // State
    jobs,
    jobHistory,
    jobCount,
    runningCount,
    loading: isLoading,
    error: lastError,

    // Actions
    addJob,
    removeJob,
    toggleJob,
    runJob,
    runPendingJobs,
    clear,

    // Utilities
    getJob,
    getAllJobs,
    getEnabledJobs,
    getRunningJobs,
    getJobHistory,
    getJobsToRun,
    getStats,
  };
}
