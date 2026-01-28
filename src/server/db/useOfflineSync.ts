import { computed, onUnmounted, ref } from "vue";

export interface OfflineSyncConfig {
  storageKey?: string;
  syncInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
  conflictResolution?: "client" | "server" | "manual";
}

export interface OfflineOperation<T = any> {
  id: string;
  type: "create" | "update" | "delete";
  table: string;
  data: T;
  timestamp: number;
  retries: number;
  status: "pending" | "syncing" | "completed" | "failed";
  error?: Error;
}

export interface SyncResult {
  success: boolean;
  operationsProcessed: number;
  operationsFailed: number;
  conflicts: OfflineOperation[];
  duration: number;
}

export interface ConflictResolution<T = any> {
  operation: OfflineOperation<T>;
  serverData?: T;
  clientData: T;
  resolution: "client" | "server" | "merge";
  resolvedData?: T;
}

export function useOfflineSync<T = any>(config: OfflineSyncConfig = {}) {
  const {
    storageKey = "offline_sync_queue",
    syncInterval = 30000,
    maxRetries = 3,
  } = config;

  const loading = ref(false);
  const error = ref<Error | null>(null);
  const isOnline = ref(true);
  const operations = ref<OfflineOperation<T>[]>([]);
  const lastSyncTime = ref<number | null>(null);
  const syncInProgress = ref(false);

  const isLoading = computed(() => loading.value);
  const lastError = computed(() => error.value);
  const isOffline = computed(() => !isOnline.value);
  const pendingOperations = computed(() => operations.value.filter(op => op.status === "pending"));
  const failedOperations = computed(() => operations.value.filter(op => op.status === "failed"));
  const syncStatus = computed(() => ({
    total: operations.value.length,
    pending: pendingOperations.value.length,
    failed: failedOperations.value.length,
    lastSync: lastSyncTime.value,
  }));

  let syncTimer: NodeJS.Timeout | null = null;

  // Load operations from storage
  const loadOperations = (): void => {
    try {
      if (typeof localStorage !== "undefined") {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          operations.value = JSON.parse(stored);
        }
      }
    } catch (err) {
      console.error("Failed to load offline operations:", err);
    }
  };

  // Save operations to storage
  const saveOperations = (): void => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(storageKey, JSON.stringify(operations.value));
      }
    } catch (err) {
      console.error("Failed to save offline operations:", err);
    }
  };

  // Add operation to queue
  const addOperation = (
    type: "create" | "update" | "delete",
    table: string,
    data: T,
  ): string => {
    const operation: OfflineOperation<T> = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      table,
      data,
      timestamp: Date.now(),
      retries: 0,
      status: "pending",
    };

    operations.value.push(operation as OfflineOperation<T>);
    saveOperations();

    return operation.id;
  };

  // Remove operation from queue
  const removeOperation = (operationId: string): boolean => {
    const index = operations.value.findIndex(op => op.id === operationId);
    if (index >= 0) {
      operations.value.splice(index, 1);
      saveOperations();
      return true;
    }
    return false;
  };

  // Update operation status
  const updateOperationStatus = (
    operationId: string,
    status: OfflineOperation["status"],
    error?: Error,
  ): void => {
    const operation = operations.value.find(op => op.id === operationId);
    if (operation) {
      operation.status = status;
      if (error) {
        operation.error = error;
      }
      saveOperations();
    }
  };

  // Sync single operation
  const syncOperation = async (operation: OfflineOperation<T>): Promise<boolean> => {
    updateOperationStatus(operation.id, "syncing");

    try {
      // This would typically make an API call to sync the operation
      // For now, we'll simulate the sync process
      console.log("Syncing operation:", operation);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate random failure for demo
      if (Math.random() < 0.2) {
        throw new Error("Network error");
      }

      updateOperationStatus(operation.id, "completed");
      return true;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      operation.retries++;

      if (operation.retries >= maxRetries) {
        updateOperationStatus(operation.id, "failed", errorObj);
      } else {
        updateOperationStatus(operation.id, "pending", errorObj!);
      }

      return false;
    }
  };

  // Handle conflicts
  const resolveConflict = async (conflict: ConflictResolution<T>): Promise<T> => {
    switch (conflict.resolution) {
      case "client":
        return conflict.clientData;

      case "server":
        return conflict.serverData || conflict.clientData;

      case "merge":
        // Simple merge strategy - in real implementation, this would be more sophisticated
        return { ...conflict.serverData, ...conflict.clientData } as T;

      default:
        return conflict.clientData;
    }
  };

  // Sync all pending operations
  const sync = async (): Promise<SyncResult> => {
    if (syncInProgress.value || !isOnline.value) {
      return {
        success: false,
        operationsProcessed: 0,
        operationsFailed: 0,
        conflicts: [],
        duration: 0,
      };
    }

    syncInProgress.value = true;
    loading.value = true;
    error.value = null;

    const startTime = Date.now();
    let operationsProcessed = 0;
    let operationsFailed = 0;
    const conflicts: OfflineOperation[] = [];

    try {
      const pending = [...pendingOperations.value];

      for (const operation of pending) {
        const success = await syncOperation(operation as OfflineOperation<T>);

        if (success) {
          operationsProcessed++;
        } else {
          operationsFailed++;

          // Check if this is a conflict that needs resolution
          if (operation.error?.message.includes("conflict")) {
            conflicts.push(operation);
          }
        }
      }

      lastSyncTime.value = Date.now();

      const result: SyncResult = {
        success: operationsFailed === 0,
        operationsProcessed,
        operationsFailed,
        conflicts,
        duration: Date.now() - startTime,
      };

      return result;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));

      return {
        success: false,
        operationsProcessed,
        operationsFailed,
        conflicts,
        duration: Date.now() - startTime,
      };
    } finally {
      syncInProgress.value = false;
      loading.value = false;
    }
  };

  // Retry failed operations
  const retryFailedOperations = async (): Promise<void> => {
    const failed = [...failedOperations.value];

    for (const operation of failed) {
      operation.retries = 0;
      operation.status = "pending";
      operation.error = undefined as any;
    }

    saveOperations();
    await sync();
  };

  // Clear completed operations
  const clearCompleted = (): void => {
    operations.value = operations.value.filter(op => op.status !== "completed");
    saveOperations();
  };

  // Clear all operations
  const clearAll = (): void => {
    operations.value = [];
    saveOperations();
  };

  // Get operation by ID
  const getOperation = (operationId: string): OfflineOperation<T> | undefined => {
    return operations.value.find(op => op.id === operationId) as OfflineOperation<T> | undefined;
  };

  // Manual conflict resolution
  const resolveConflictManually = async (
    operationId: string,
    resolution: ConflictResolution<T>,
  ): Promise<void> => {
    const operation = getOperation(operationId);
    if (!operation) return;

    const resolvedData = await resolveConflict(resolution);

    // Update operation with resolved data and retry
    operation.data = resolvedData;
    operation.status = "pending";
    operation.retries = 0;
    delete operation.error;

    saveOperations();
  };

  // Setup online/offline detection
  const setupConnectivityDetection = (): void => {
    if (typeof window !== "undefined") {
      const updateOnlineStatus = () => {
        isOnline.value = navigator.onLine;

        if (isOnline.value && pendingOperations.value.length > 0) {
          // Auto-sync when coming back online
          sync().catch(() => {});
        }
      };

      window.addEventListener("online", updateOnlineStatus);
      window.addEventListener("offline", updateOnlineStatus);

      // Initial status
      updateOnlineStatus();
    }
  };

  // Setup periodic sync
  const setupPeriodicSync = (): void => {
    if (syncTimer) {
      clearInterval(syncTimer);
    }

    syncTimer = setInterval(() => {
      if (isOnline.value && pendingOperations.value.length > 0) {
        sync().catch(() => {});
      }
    }, syncInterval);
  };

  // Initialize
  const initialize = (): void => {
    loadOperations();
    setupConnectivityDetection();
    setupPeriodicSync();
  };

  // Cleanup
  const cleanup = (): void => {
    if (syncTimer) {
      clearInterval(syncTimer);
      syncTimer = null;
    }
  };

  // Auto-initialize
  initialize();

  // Auto-cleanup on unmount
  if (typeof onUnmounted === "function") {
    onUnmounted(cleanup);
  }

  return {
    // State
    loading: isLoading,
    error: lastError,
    isOnline,
    isOffline,
    operations,
    pendingOperations,
    failedOperations,
    syncStatus,
    lastSyncTime,
    syncInProgress,

    // Actions
    addOperation,
    removeOperation,
    updateOperationStatus,
    sync,
    retryFailedOperations,
    clearCompleted,
    clearAll,
    getOperation,
    resolveConflictManually,

    // Utilities
    initialize,
    cleanup,
  };
}
