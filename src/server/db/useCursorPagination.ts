import { ref, computed } from 'vue'

export interface CursorPaginationOptions {
  pageSize?: number
  initialCursor?: string | null
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export interface CursorPaginationResult<T = any> {
  data: T[]
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string
  endCursor?: string
  totalCount?: number
}

export interface CursorPaginationState<T = any> {
  data: T[]
  loading: boolean
  error: Error | null
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string
  endCursor?: string
  totalCount?: number
  isFetchingNextPage: boolean
  isFetchingPreviousPage: boolean
}

export function useCursorPagination<T = any>(
  fetchPage: (cursor: string | null, direction: 'forward' | 'backward', limit: number) => Promise<CursorPaginationResult<T>>,
  options: CursorPaginationOptions = {}
) {
  const {
    pageSize = 20,
    initialCursor = null,
    orderBy = 'id',
    orderDirection = 'asc'
  } = options

  const state = ref<CursorPaginationState<T>>({
    data: [],
    loading: false,
    error: null,
    hasNextPage: false,
    hasPreviousPage: false,
    totalCount: undefined,
    isFetchingNextPage: false,
    isFetchingPreviousPage: false
  })

  const data = computed(() => state.value.data)
  const loading = computed(() => state.value.loading)
  const error = computed(() => state.value.error)
  const hasNextPage = computed(() => state.value.hasNextPage)
  const hasPreviousPage = computed(() => state.value.hasPreviousPage)
  const startCursor = computed(() => state.value.startCursor)
  const endCursor = computed(() => state.value.endCursor)
  const totalCount = computed(() => state.value.totalCount)
  const isFetchingNextPage = computed(() => state.value.isFetchingNextPage)
  const isFetchingPreviousPage = computed(() => state.value.isFetchingPreviousPage)
  const isEmpty = computed(() => state.value.data.length === 0 && !loading.value)

  const fetchInitialPage = async (): Promise<void> => {
    state.value.loading = true
    state.value.error = null

    try {
      const result = await fetchPage(initialCursor, 'forward', pageSize)
      
      state.value.data = result.data
      state.value.hasNextPage = result.hasNextPage
      state.value.hasPreviousPage = result.hasPreviousPage
      state.value.startCursor = result.startCursor
      state.value.endCursor = result.endCursor
      state.value.totalCount = result.totalCount

    } catch (err) {
      state.value.error = err instanceof Error ? err : new Error(String(err))
    } finally {
      state.value.loading = false
    }
  }

  const fetchNextPage = async (): Promise<void> => {
    if (!state.value.hasNextPage || state.value.isFetchingNextPage) {
      return
    }

    state.value.isFetchingNextPage = true

    try {
      const result = await fetchPage(state.value.endCursor || null, 'forward', pageSize)
      
      state.value.data = [...state.value.data, ...result.data]
      state.value.hasNextPage = result.hasNextPage
      state.value.endCursor = result.endCursor
      if (result.totalCount !== undefined) {
        state.value.totalCount = result.totalCount
      }

    } catch (err) {
      state.value.error = err instanceof Error ? err : new Error(String(err))
    } finally {
      state.value.isFetchingNextPage = false
    }
  }

  const fetchPreviousPage = async (): Promise<void> => {
    if (!state.value.hasPreviousPage || state.value.isFetchingPreviousPage) {
      return
    }

    state.value.isFetchingPreviousPage = true

    try {
      const result = await fetchPage(state.value.startCursor || null, 'backward', pageSize)
      
      state.value.data = [...result.data, ...state.value.data]
      state.value.hasPreviousPage = result.hasPreviousPage
      state.value.startCursor = result.startCursor
      if (result.totalCount !== undefined) {
        state.value.totalCount = result.totalCount
      }

    } catch (err) {
      state.value.error = err instanceof Error ? err : new Error(String(err))
    } finally {
      state.value.isFetchingPreviousPage = false
    }
  }

  const refresh = async (): Promise<void> => {
    const currentEndCursor = state.value.endCursor
    await fetchInitialPage()
    
    // If we had data before, try to fetch back to where we were
    if (currentEndCursor && state.value.hasNextPage) {
      let tempCursor = state.value.endCursor
      while (tempCursor && tempCursor !== currentEndCursor) {
        await fetchNextPage()
        if (state.value.endCursor === tempCursor) break
        tempCursor = state.value.endCursor
      }
    }
  }

  const reset = (): void => {
    state.value.data = []
    state.value.loading = false
    state.value.error = null
    state.value.hasNextPage = false
    state.value.hasPreviousPage = false
    state.value.startCursor = undefined
    state.value.endCursor = undefined
    state.value.totalCount = undefined
    state.value.isFetchingNextPage = false
    state.value.isFetchingPreviousPage = false
  }

  const prependData = (newData: T[]): void => {
    state.value.data = [...newData, ...state.value.data]
  }

  const appendData = (newData: T[]): void => {
    state.value.data = [...state.value.data, ...newData]
  }

  const updateData = (updater: (data: T[]) => T[]): void => {
    state.value.data = updater(state.value.data)
  }

  const removeItem = (predicate: (item: T, index: number) => boolean): void => {
    state.value.data = state.value.data.filter((item, index) => !predicate(item, index))
  }

  const updateItem = (predicate: (item: T, index: number) => boolean, updater: (item: T) => T): void => {
    state.value.data = state.value.data.map((item, index) => 
      predicate(item, index) ? updater(item) : item
    )
  }

  return {
    // State
    data,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    startCursor,
    endCursor,
    totalCount,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isEmpty,
    
    // Actions
    fetchInitialPage,
    fetchNextPage,
    fetchPreviousPage,
    refresh,
    reset,
    prependData,
    appendData,
    updateData,
    removeItem,
    updateItem
  }
}
