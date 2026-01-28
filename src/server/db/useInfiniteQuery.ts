import { computed, getCurrentInstance, onUnmounted, ref, watch } from "vue";

export interface InfiniteQueryOptions<TData = any, TParams = any> {
  queryFn: (pageParam: number | undefined, params: TParams) => Promise<{
    data: TData[];
    hasNextPage: boolean;
    nextCursor?: number;
  }>;
  initialPageParam?: number;
  getNextPageParam: (lastPage: any, allPages: any[]) => number | undefined;
  params?: TParams;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export interface InfiniteQueryState<TData = any> {
  data: TData[][];
  loading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isRefetching: boolean;
  lastUpdated: number | null;
}

export interface InfiniteQueryResult<TData = any> {
  data: TData[];
  dataPages: TData[][];
  loading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isRefetching: boolean;
  isEmpty: boolean;
  fetchNextPage: () => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
}

export function useInfiniteQuery<TData = any, TParams = any>(
  options: InfiniteQueryOptions<TData, TParams>,
): InfiniteQueryResult<TData> {
  const {
    queryFn,
    initialPageParam = 1,
    getNextPageParam,
    params,
    enabled = true,
    refetchOnWindowFocus = true,
    staleTime = 0,
    cacheTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  const state = ref<InfiniteQueryState<TData>>({
    data: [],
    loading: false,
    error: null,
    hasNextPage: true,
    isFetchingNextPage: false,
    isRefetching: false,
    lastUpdated: null,
  });

  const pageParams = ref<(number | undefined)[]>([initialPageParam]);
  const lastFetchTime = ref<number>(0);

  const data = computed(() => state.value.data.flat());
  const dataPages = computed(() => state.value.data);
  const loading = computed(() => state.value.loading);
  const error = computed(() => state.value.error);
  const hasNextPage = computed(() => state.value.hasNextPage);
  const isFetchingNextPage = computed(() => state.value.isFetchingNextPage);
  const isRefetching = computed(() => state.value.isRefetching);
  const isEmpty = computed(() => data.value.length === 0 && !loading.value);

  const isStale = computed(() => {
    if (staleTime === 0) return true;
    return Date.now() - lastFetchTime.value > staleTime;
  });

  const shouldFetch = computed(() => {
    return enabled && (state.value.data.length === 0 || isStale.value);
  });

  const executeQuery = async (pageParam: number | undefined, isRefetch = false): Promise<void> => {
    if (!enabled) return;

    if (isRefetch) {
      state.value.isRefetching = true;
    } else if (state.value.data.length === 0) {
      state.value.loading = true;
    } else {
      state.value.isFetchingNextPage = true;
    }

    state.value.error = null;

    try {
      const result = await queryFn(pageParam, params || ({} as TParams));

      if (isRefetch) {
        state.value.data = [result.data] as TData[][];
        pageParams.value = [pageParam];
      } else {
        state.value.data.push(result.data as TData[]);
        pageParams.value.push(pageParam);
      }

      state.value.hasNextPage = result.hasNextPage;
      lastFetchTime.value = Date.now();
      state.value.lastUpdated = Date.now();
    } catch (err) {
      state.value.error = err instanceof Error ? err : new Error(String(err));
    } finally {
      state.value.loading = false;
      state.value.isFetchingNextPage = false;
      state.value.isRefetching = false;
    }
  };

  const fetchNextPage = async (): Promise<void> => {
    if (!state.value.hasNextPage || state.value.isFetchingNextPage || !enabled) {
      return;
    }

    const lastPage = state.value.data[state.value.data.length - 1];
    const allPages = state.value.data;
    const nextPageParam = getNextPageParam(lastPage, allPages);

    if (nextPageParam === undefined) {
      state.value.hasNextPage = false;
      return;
    }

    await executeQuery(nextPageParam, false);
  };

  const refetch = async (): Promise<void> => {
    if (!enabled) return;

    await executeQuery(initialPageParam, true);
  };

  const reset = (): void => {
    state.value.data = [];
    state.value.loading = false;
    state.value.error = null;
    state.value.hasNextPage = true;
    state.value.isFetchingNextPage = false;
    state.value.isRefetching = false;
    state.value.lastUpdated = null;
    pageParams.value = [initialPageParam];
    lastFetchTime.value = 0;
  };

  // Auto-fetch when enabled or dependencies change
  watch(
    [() => enabled, () => params],
    () => {
      if (shouldFetch.value) {
        refetch();
      }
    },
    { immediate: true, deep: true },
  );

  // Window focus refetch
  let handleFocus: (() => void) | null = null;

  if (typeof window !== "undefined" && refetchOnWindowFocus) {
    handleFocus = () => {
      if (document.visibilityState === "visible" && isStale.value) {
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleFocus);
  }

  // Cache cleanup
  let cacheTimer: NodeJS.Timeout | null = null;

  if (cacheTime > 0) {
    cacheTimer = setTimeout(() => {
      if (Date.now() - lastFetchTime.value > cacheTime) {
        reset();
      }
    }, cacheTime);
  }

  // Cleanup on unmount
  const cleanup = (): void => {
    if (handleFocus) {
      document.removeEventListener("visibilitychange", handleFocus);
    }
    if (cacheTimer) {
      clearTimeout(cacheTimer);
    }
  };

  // Auto-cleanup when component unmounts (if in Vue context)
  if (typeof getCurrentInstance === "function") {
    onUnmounted(cleanup);
  }

  return {
    data: data.value as TData[],
    dataPages: dataPages.value as TData[][],
    loading: loading.value,
    error: error.value,
    hasNextPage: hasNextPage.value,
    isFetchingNextPage: isFetchingNextPage.value,
    isRefetching: isRefetching.value,
    isEmpty: isEmpty.value,
    fetchNextPage,
    refetch,
    reset,
  };
}

// Helper function for common getNextPageParam patterns
export const createGetNextPageParam = {
  offset: (lastPage: any, allPages: any[]) => {
    const currentData = lastPage.data || lastPage;
    return currentData.length > 0 ? allPages.length * (currentData.length || 10) : undefined;
  },

  cursor: (lastPage: any) => {
    return lastPage.nextCursor;
  },

  page: (lastPage: any, allPages: any[]) => {
    return lastPage.hasNextPage ? allPages.length + 1 : undefined;
  },
};
