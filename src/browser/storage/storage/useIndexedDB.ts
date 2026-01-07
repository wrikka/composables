import { ref } from 'vue'

export interface UseIndexedDBOptions {
  dbName: string
  version?: number
  storeName: string
  keyPath?: string
}

export function useIndexedDB<T extends Record<string, any>>(options: UseIndexedDBOptions) {
  const db = ref<IDBDatabase | null>(null)
  const isReady = ref(false)
  const error = ref<string | null>(null)

  const initDB = async () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(options.dbName, options.version || 1)

      request.onerror = () => {
        error.value = request.error?.message || 'Failed to open database'
        reject(request.error)
      }

      request.onsuccess = () => {
        db.value = request.result
        isReady.value = true
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(options.storeName)) {
          db.createObjectStore(options.storeName, { keyPath: options.keyPath || 'id' })
        }
      }
    })
  }

  const add = async (data: T) => {
    if (!db.value) await initDB()
    
    return new Promise<T>((resolve, reject) => {
      const transaction = db.value!.transaction([options.storeName], 'readwrite')
      const store = transaction.objectStore(options.storeName)
      const request = store.add(data)

      request.onsuccess = () => resolve(data)
      request.onerror = () => reject(request.error)
    })
  }

  const get = async (key: string) => {
    if (!db.value) await initDB()
    
    return new Promise<T | undefined>((resolve, reject) => {
      const transaction = db.value!.transaction([options.storeName], 'readonly')
      const store = transaction.objectStore(options.storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  const getAll = async () => {
    if (!db.value) await initDB()
    
    return new Promise<T[]>((resolve, reject) => {
      const transaction = db.value!.transaction([options.storeName], 'readonly')
      const store = transaction.objectStore(options.storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  const update = async (data: T) => {
    if (!db.value) await initDB()
    
    return new Promise<T>((resolve, reject) => {
      const transaction = db.value!.transaction([options.storeName], 'readwrite')
      const store = transaction.objectStore(options.storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve(data)
      request.onerror = () => reject(request.error)
    })
  }

  const remove = async (key: string) => {
    if (!db.value) await initDB()
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.value!.transaction([options.storeName], 'readwrite')
      const store = transaction.objectStore(options.storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  const clear = async () => {
    if (!db.value) await initDB()
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.value!.transaction([options.storeName], 'readwrite')
      const store = transaction.objectStore(options.storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  return {
    db,
    isReady,
    error,
    initDB,
    add,
    get,
    getAll,
    update,
    remove,
    clear
  }
}
