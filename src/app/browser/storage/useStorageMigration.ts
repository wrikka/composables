import { ref } from 'vue'

export interface StorageMigrationState {
  migrate: (data: any, fromVersion: string, toVersion: string) => Promise<any>
  isMigrating: boolean
  error: Error | null
}

export function useStorageMigration() {
  const isMigrating = ref(false)
  const error = ref<Error | null>(null)

  const migrations: Record<string, (data: any) => any> = {
    '1.0->1.1': (data) => ({
      ...data,
      version: '1.1',
      migratedAt: new Date().toISOString(),
    }),
    '1.1->1.2': (data) => ({
      ...data,
      version: '1.2',
      migratedAt: new Date().toISOString(),
    }),
    '1.2->2.0': (data) => ({
      ...data,
      version: '2.0',
      migratedAt: new Date().toISOString(),
      newField: 'default',
    }),
  }

  const migrate = async (data: any, fromVersion: string, toVersion: string): Promise<any> => {
    isMigrating.value = true
    error.value = null

    try {
      let currentData = data
      let currentVersion = fromVersion

      while (currentVersion !== toVersion) {
        const migrationKey = `${currentVersion}->${toVersion}`
        const migration = migrations[migrationKey]

        if (!migration) {
          throw new Error(`No migration found from ${currentVersion} to ${toVersion}`)
        }

        currentData = migration(currentData)
        currentVersion = toVersion
      }

      return currentData
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isMigrating.value = false
    }
  }

  return {
    migrate,
    isMigrating,
    error,
  }
}
