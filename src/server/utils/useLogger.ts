import { computed, ref } from "vue";

export interface LogLevel {
  level: "debug" | "info" | "warn" | "error";
  timestamp: number;
  message: string;
  context: string | undefined;
  metadata: Record<string, any> | undefined;
}

export interface LoggerConfig {
  level?: "debug" | "info" | "warn" | "error";
  enableConsole?: boolean;
  enableFile?: boolean;
  enableRemote?: boolean;
  remoteEndpoint?: string;
  maxLogSize?: number;
  bufferSize?: number;
  flushInterval?: number;
}

export interface LogStats {
  total: number;
  debug: number;
  info: number;
  warn: number;
  error: number;
  bufferSize: number;
  lastFlush: number;
}

export function useLogger(config: LoggerConfig = {}) {
  const {
    level = "info",
    enableConsole = true,
    enableFile = false,
    enableRemote = false,
    remoteEndpoint,
    maxLogSize = 1000,
    bufferSize = 100,
    flushInterval = 5000,
  } = config;

  const logs = ref<LogLevel[]>([]);
  const stats = ref<LogStats>({
    total: 0,
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
    bufferSize: 0,
    lastFlush: Date.now(),
  });

  const logStats = computed(() => stats.value);
  const recentLogs = computed(() => logs.value.slice(-bufferSize));

  let flushTimer: NodeJS.Timeout | null = null;

  // Check if log level should be processed
  const shouldLog = (logLevel: LogLevel["level"]): boolean => {
    const levels = ["debug", "info", "warn", "error"];
    const currentLevelIndex = levels.indexOf(level);
    const logLevelIndex = levels.indexOf(logLevel);
    return logLevelIndex >= currentLevelIndex;
  };

  // Create log entry
  const createLog = (
    logLevel: LogLevel["level"],
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): LogLevel => {
    return {
      level: logLevel,
      timestamp: Date.now(),
      message,
      context,
      metadata,
    };
  };

  // Add log to buffer
  const addLog = (log: LogLevel): void => {
    if (!shouldLog(log.level)) return;

    logs.value.push(log);

    // Update stats
    stats.value.total++;
    stats.value[log.level]++;
    stats.value.bufferSize = logs.value.length;

    // Console output
    if (enableConsole) {
      outputToConsole(log);
    }

    // Check buffer size
    if (logs.value.length >= maxLogSize) {
      flushLogs();
    }
  };

  // Output to console
  const outputToConsole = (log: LogLevel): void => {
    const timestamp = new Date(log.timestamp).toISOString();
    const contextStr = log.context ? `[${log.context}]` : "";
    const message = `${timestamp} ${contextStr} ${log.message}`;

    switch (log.level) {
      case "debug":
        console.debug(message, log.metadata);
        break;
      case "info":
        console.info(message, log.metadata);
        break;
      case "warn":
        console.warn(message, log.metadata);
        break;
      case "error":
        console.error(message, log.metadata);
        break;
    }
  };

  // Flush logs to file/remote
  const flushLogs = async (): Promise<void> => {
    if (logs.value.length === 0) return;

    const logsToFlush = [...logs.value];
    logs.value = [];
    stats.value.bufferSize = 0;
    stats.value.lastFlush = Date.now();

    try {
      // Send to remote endpoint
      if (enableRemote && remoteEndpoint) {
        await fetch(remoteEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logs: logsToFlush }),
        });
      }

      // Save to file (would need server-side implementation)
      if (enableFile) {
        console.log("Would save logs to file:", logsToFlush);
      }
    } catch (err) {
      console.error("Failed to flush logs:", err);
    }
  };

  // Log methods
  const debug = (message: string, context?: string, metadata?: Record<string, any>): void => {
    addLog(createLog("debug", message, context, metadata));
  };

  const info = (message: string, context?: string, metadata?: Record<string, any>): void => {
    addLog(createLog("info", message, context, metadata));
  };

  const warn = (message: string, context?: string, metadata?: Record<string, any>): void => {
    addLog(createLog("warn", message, context, metadata));
  };

  const error = (message: string, context?: string, metadata?: Record<string, any>): void => {
    addLog(createLog("error", message, context, metadata));
  };

  // Log with custom level
  const log = (
    logLevel: LogLevel["level"],
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void => {
    addLog(createLog(logLevel, message, context, metadata));
  };

  // Clear logs
  const clear = (): void => {
    logs.value = [];
    stats.value.bufferSize = 0;
  };

  // Get logs by level
  const getLogsByLevel = (logLevel: LogLevel["level"]): LogLevel[] => {
    return logs.value.filter(log => log.level === logLevel);
  };

  // Get logs by context
  const getLogsByContext = (context: string): LogLevel[] => {
    return logs.value.filter(log => log.context === context);
  };

  // Get logs in time range
  const getLogsByTimeRange = (startTime: number, endTime: number): LogLevel[] => {
    return logs.value.filter(log => log.timestamp >= startTime && log.timestamp <= endTime);
  };

  // Search logs
  const searchLogs = (query: string): LogLevel[] => {
    const lowerQuery = query.toLowerCase();
    return logs.value.filter(log =>
      log.message.toLowerCase().includes(lowerQuery)
      || (log.context && log.context.toLowerCase().includes(lowerQuery))
    );
  };

  // Setup auto-flush
  const setupAutoFlush = (): void => {
    if (flushTimer) {
      clearInterval(flushTimer);
    }

    if (flushInterval > 0) {
      flushTimer = setInterval(() => {
        flushLogs();
      }, flushInterval);
    }
  };

  // Stop auto-flush
  const stopAutoFlush = (): void => {
    if (flushTimer) {
      clearInterval(flushTimer);
      flushTimer = null;
    }
  };

  // Export logs
  const exportLogs = (format: "json" | "csv" = "json"): string => {
    if (format === "json") {
      return JSON.stringify(logs.value, null, 2);
    } else {
      // CSV format
      const headers = ["timestamp", "level", "message", "context", "metadata"];
      const csvData = logs.value.map(log => [
        new Date(log.timestamp).toISOString(),
        log.level,
        log.message,
        log.context || "",
        JSON.stringify(log.metadata || {}),
      ]);

      return [headers, ...csvData].map(row => row.join(",")).join("\n");
    }
  };

  // Initialize
  setupAutoFlush();

  return {
    // State
    logs: recentLogs,
    stats: logStats,

    // Log methods
    debug,
    info,
    warn,
    error,
    log,

    // Actions
    flushLogs,
    clear,
    exportLogs,

    // Utilities
    getLogsByLevel,
    getLogsByContext,
    getLogsByTimeRange,
    searchLogs,

    // Configuration
    setupAutoFlush,
    stopAutoFlush,
  };
}

// Create global logger instance
export const logger = useLogger();
