import { readonly, type Ref, ref } from "vue";

export interface QueryOptions {
  table?: string;
  where?: Record<string, any>;
  orderBy?: Record<string, "asc" | "desc">;
  limit?: number;
  offset?: number;
  include?: Record<string, any>;
}

export interface QueryResult<T = any> {
  data: T[];
  total: number;
  success: boolean;
  error: Error | null;
  loading: boolean;
}

export interface UseQueryOptions<T = any> {
  query: string | (() => Promise<T[]>);
  variables?: Record<string, any>;
  immediate?: boolean;
  refetchInterval?: number;
  enabled?: boolean;
  onSuccess?: (data: T[]) => void;
  onError?: (error: Error) => void;
}

export function useQuery<T = any>(options: UseQueryOptions<T>) {
  const {
    query,
    variables = {},
    immediate = true,
    refetchInterval = 0,
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const data = ref<T[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const success = ref(false);

  let refetchTimer: NodeJS.Timeout | null = null;

  const execute = async (): Promise<QueryResult<T>> => {
    if (!enabled) {
      return {
        data: data.value as T[],
        total: data.value.length,
        success: false,
        error: new Error("Query is disabled"),
        loading: false,
      };
    }

    loading.value = true;
    error.value = null;
    success.value = false;

    try {
      let result: T[];

      if (typeof query === "string") {
        // Mock SQL query execution
        console.log("Executing query:", query, variables);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        result = [] as T[]; // Mock result
      } else {
        // Execute function
        result = await query();
      }

      data.value = result as T[];
      success.value = true;

      onSuccess?.(result);

      return {
        data: result,
        total: result.length,
        success: true,
        error: null,
        loading: false,
      };
    } catch (err) {
      const errorObj = err as Error;
      error.value = errorObj;
      success.value = false;

      onError?.(errorObj);

      return {
        data: [],
        total: 0,
        success: false,
        error: errorObj,
        loading: false,
      };
    } finally {
      loading.value = false;
    }
  };

  const refetch = async () => {
    return await execute();
  };

  const startRefetchInterval = () => {
    if (refetchInterval > 0) {
      refetchTimer = setInterval(() => {
        execute();
      }, refetchInterval);
    }
  };

  const stopRefetchInterval = () => {
    if (refetchTimer) {
      clearInterval(refetchTimer);
      refetchTimer = null;
    }
  };

  const reset = () => {
    data.value = [];
    loading.value = false;
    error.value = null;
    success.value = false;
    stopRefetchInterval();
  };

  // Auto-execute if immediate
  if (immediate && enabled) {
    execute();
    startRefetchInterval();
  }

  return {
    data: readonly(data) as Ref<T[]>,
    loading: readonly(loading) as Ref<boolean>,
    error: readonly(error) as Ref<Error | null>,
    success: readonly(success) as Ref<boolean>,
    execute,
    refetch,
    reset,
    startRefetchInterval,
    stopRefetchInterval,
  };
}
