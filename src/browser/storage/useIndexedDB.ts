import { ref } from 'vue'

export function useIndexedDB<T>(
  dbName: string,
  storeName: string,
  version: number = 1
) {
  const db = ref<IDBDatabase | null>(null)
  const error = ref<string | null>(null)

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version)

      request.onupgradeneeded = (event) => {
        const dbInstance = (event.target as IDBOpenDBRequest).result
        if (!dbInstance.objectStoreNames.contains(storeName)) {
          dbInstance.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true })
        }
      }

      request.onsuccess = (event) => {
        db.value = (event.target as IDBOpenDBRequest).result
        resolve(db.value)
      }

      request.onerror = (event) => {
        error.value = (event.target as IDBOpenDBRequest).error?.message || 'Unknown error'
        reject(error.value)
      }
    })
  }

  const performAction = async (action: (store: IDBObjectStore) => IDBRequest): Promise<T | T[] | void> => {
    if (!db.value) await openDB()
    if (!db.value) throw new Error('Database not available')

    return new Promise((resolve, reject) => {
      const transaction = db.value!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = action(store)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        error.value = (event.target as IDBRequest).error?.message || 'Transaction error'
        reject(error.value)
      }
    })
  }

  const get = (key: IDBValidKey): Promise<T | undefined> => performAction(store => store.get(key)) as Promise<T | undefined>
  const getAll = (): Promise<T[]> => performAction(store => store.getAll()) as Promise<T[]>
  const add = (value: T): Promise<IDBValidKey> => performAction(store => store.add(value)) as Promise<IDBValidKey>
  const put = (value: T): Promise<IDBValidKey> => performAction(store => store.put(value)) as Promise<IDBValidKey>
  const remove = (key: IDBValidKey): Promise<void> => performAction(store => store.delete(key)) as Promise<void>
  const clear = (): Promise<void> => performAction(store => store.clear()) as Promise<void>

  openDB().catch(e => console.error(e))

  return { db, error, get, getAll, add, put, remove, clear }
}