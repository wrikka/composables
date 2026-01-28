import { ref, computed, type Ref } from 'vue'

export interface ConnectionPoolConfig {
  minConnections?: number
  maxConnections?: number
  idleTimeoutMillis?: number
  acquireTimeoutMillis?: number
  createTimeoutMillis?: number
  destroyTimeoutMillis?: number
  reapIntervalMillis?: number
  createRetryIntervalMillis?: number
}

export interface PoolStats {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  waitingClients: number
}

export interface ConnectionPool<T> {
  acquire: () => Promise<T>
  release: (connection: T) => Promise<void>
  destroy: (connection: T) => Promise<void>
  getStats: () => PoolStats
  close: () => Promise<void>
}

export function useConnectionPool<T>(
  createConnection: () => Promise<T>,
  destroyConnection: (connection: T) => Promise<void>,
  config: ConnectionPoolConfig = {}
) {
  const {
    minConnections = 2,
    maxConnections = 10,
    idleTimeoutMillis = 30000,
    acquireTimeoutMillis = 30000,
    createTimeoutMillis = 30000,
    destroyTimeoutMillis = 5000,
    reapIntervalMillis = 1000,
    createRetryIntervalMillis = 200
  } = config

  const connections = ref<T[]>([])
  const activeConnections = ref(new Set<T>())
  const waitingQueue = ref<Array<{
    resolve: (connection: T) => void
    reject: (error: Error) => void
    timeout: NodeJS.Timeout
  }>>([])

  const stats = computed<PoolStats>(() => ({
    totalConnections: connections.value.length,
    activeConnections: activeConnections.value.size,
    idleConnections: connections.value.length - activeConnections.value.size,
    waitingClients: waitingQueue.value.length
  }))

  let isClosing = false
  let reapTimer: NodeJS.Timeout | null = null

  const createNewConnection = async (): Promise<T> => {
    try {
      const connection = await Promise.race([
        createConnection(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Connection creation timeout')), createTimeoutMillis)
        )
      ])
      return connection
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, createRetryIntervalMillis))
      throw error
    }
  }

  const acquire = async (): Promise<T> => {
    if (isClosing) {
      throw new Error('Connection pool is closing')
    }

    // Try to get an idle connection
    const idleConnection = connections.value.find(conn => !activeConnections.value.has(conn))
    if (idleConnection) {
      activeConnections.value.add(idleConnection)
      return idleConnection
    }

    // Create new connection if under max
    if (connections.value.length < maxConnections) {
      try {
        const newConnection = await createNewConnection()
        connections.value.push(newConnection)
        activeConnections.value.add(newConnection)
        return newConnection
      } catch (error) {
        // Fall through to queue
      }
    }

    // Wait for available connection
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = waitingQueue.value.findIndex(item => item.resolve === resolve)
        if (index >= 0) {
          waitingQueue.value.splice(index, 1)
        }
        reject(new Error('Connection acquire timeout'))
      }, acquireTimeoutMillis)

      waitingQueue.value.push({ resolve, reject, timeout })
    })
  }

  const release = async (connection: T): Promise<void> => {
    if (!activeConnections.value.has(connection)) {
      return
    }

    activeConnections.value.delete(connection)

    // Check if someone is waiting
    const waiting = waitingQueue.value.shift()
    if (waiting) {
      clearTimeout(waiting.timeout)
      activeConnections.value.add(connection)
      waiting.resolve(connection)
      return
    }

    // Consider destroying if over min connections
    if (connections.value.length > minConnections) {
      setTimeout(() => {
        if (!activeConnections.value.has(connection) && connections.value.length > minConnections) {
          destroyConnection(connection).catch(() => {})
          const index = connections.value.indexOf(connection)
          if (index >= 0) {
            connections.value.splice(index, 1)
          }
        }
      }, idleTimeoutMillis)
    }
  }

  const destroy = async (connection: T): Promise<void> => {
    activeConnections.value.delete(connection)
    const index = connections.value.indexOf(connection)
    if (index >= 0) {
      connections.value.splice(index, 1)
    }
    await destroyConnection(connection)
  }

  const reapIdleConnections = (): void => {
    connections.value.forEach(async (connection) => {
      if (!activeConnections.value.has(connection) && connections.value.length > minConnections) {
        await destroy(connection)
      }
    })
  }

  const close = async (): Promise<void> => {
    isClosing = true
    
    // Clear waiting queue
    waitingQueue.value.forEach(({ reject, timeout }) => {
      clearTimeout(timeout)
      reject(new Error('Connection pool is closing'))
    })
    waitingQueue.value = []

    // Close all connections
    const closePromises = connections.value.map(destroy)
    await Promise.allSettled(closePromises)

    if (reapTimer) {
      clearInterval(reapTimer)
      reapTimer = null
    }
  }

  // Initialize minimum connections
  const initialize = async (): Promise<void> => {
    const initPromises = []
    for (let i = 0; i < minConnections; i++) {
      initPromises.push(
        createNewConnection()
          .then(conn => connections.value.push(conn))
          .catch(() => {}) // Ignore errors during initialization
      )
    }
    await Promise.allSettled(initPromises)
  }

  // Start reaping idle connections
  reapTimer = setInterval(reapIdleConnections, reapIntervalMillis)

  // Initialize pool
  initialize().catch(() => {})

  return {
    acquire,
    release,
    destroy,
    getStats: () => stats.value,
    close
  }
}
