import { computed, ref } from "vue";

export interface TransactionConfig {
  isolationLevel?: "READ_UNCOMMITTED" | "READ_COMMITTED" | "REPEATABLE_READ" | "SERIALIZABLE";
  timeout?: number;
  readOnly?: boolean;
  deferrable?: boolean;
}

export interface TransactionResult<T = any> {
  data: T | null;
  success: boolean;
  error: Error | null;
  rollback: boolean;
}

export function useTransaction<T = any>(
  executeTransaction: (connection: any) => Promise<T>,
) {
  const timeout = 30000;

  const loading = ref(false);
  const error = ref<Error | null>(null);
  const result = ref<TransactionResult<T> | null>(null);

  const isLoading = computed(() => loading.value);
  const lastError = computed(() => error.value);
  const transactionResult = computed(() => result.value);

  const execute = async (connection: any): Promise<TransactionResult<T>> => {
    loading.value = true;
    error.value = null;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Transaction timeout")), timeout);
      });

      const transactionPromise = executeTransaction(connection);

      const data = await Promise.race([transactionPromise, timeoutPromise]);

      const transactionResult: TransactionResult<T> = {
        data,
        success: true,
        error: null,
        rollback: false,
      };

      result.value = transactionResult;
      return transactionResult;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      error.value = errorObj;

      const transactionResult: TransactionResult<T> = {
        data: null,
        success: false,
        error: errorObj,
        rollback: true,
      };

      result.value = transactionResult;
      return transactionResult;
    } finally {
      loading.value = false;
    }
  };

  const rollback = async (): Promise<void> => {
    // This would be implemented based on the specific database driver
    // For now, it's a placeholder
    console.warn("Rollback not implemented for generic transaction");
  };

  const commit = async (): Promise<void> => {
    // This would be implemented based on the specific database driver
    // For now, it's a placeholder
    console.warn("Commit not implemented for generic transaction");
  };

  const reset = (): void => {
    loading.value = false;
    error.value = null;
    result.value = null;
  };

  return {
    execute,
    rollback,
    commit,
    reset,
    isLoading,
    lastError,
    transactionResult,
  };
}

export function useBatchTransaction<T = any>(
  transactions: Array<(connection: any) => Promise<T>>,
  _config: TransactionConfig = {},
) {
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const results = ref<TransactionResult<T>[]>([]);
  const currentIndex = ref(0);

  const isLoading = computed(() => loading.value);
  const lastError = computed(() => error.value);
  const batchResults = computed(() => results.value);
  const currentProgress = computed(() => ({
    current: currentIndex.value,
    total: transactions.length,
    percentage: transactions.length > 0 ? (currentIndex.value / transactions.length) * 100 : 0,
  }));

  const executeBatch = async (connection: any): Promise<TransactionResult<T>[]> => {
    loading.value = true;
    error.value = null;
    results.value = [];
    currentIndex.value = 0;

    try {
      const batchResults: TransactionResult<T>[] = [];

      for (let i = 0; i < transactions.length; i++) {
        currentIndex.value = i + 1;

        try {
          const data = await transactions[i]!(connection);
          batchResults.push({
            data,
            success: true,
            error: null,
            rollback: false,
          });
        } catch (err) {
          const errorObj = err instanceof Error ? err : new Error(String(err));
          batchResults.push({
            data: null,
            success: false,
            error: errorObj,
            rollback: true,
          });

          // Stop on first error for batch transaction
          throw errorObj;
        }
      }

      results.value = batchResults;
      return batchResults;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      error.value = errorObj;
      throw errorObj;
    } finally {
      loading.value = false;
    }
  };

  const reset = (): void => {
    loading.value = false;
    error.value = null;
    results.value = [];
    currentIndex.value = 0;
  };

  return {
    executeBatch,
    reset,
    isLoading,
    lastError,
    batchResults,
    currentProgress,
  };
}
