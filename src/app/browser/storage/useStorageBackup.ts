import { ref } from 'vue'

export interface StorageBackupState {
  backup: (data: any) => Promise<string>
  restore: (backupData: string) => Promise<any>
  isBackingUp: boolean
  isRestoring: boolean
  error: Error | null
}

export function useStorageBackup() {
  const isBackingUp = ref(false)
  const isRestoring = ref(false)
  const error = ref<Error | null>(null)

  const backup = async (data: any): Promise<string> => {
    isBackingUp.value = true
    error.value = null

    try {
      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data,
      }
      return JSON.stringify(backupData)
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isBackingUp.value = false
    }
  }

  const restore = async (backupData: string): Promise<any> => {
    isRestoring.value = true
    error.value = null

    try {
      const parsed = JSON.parse(backupData)
      return parsed.data
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isRestoring.value = false
    }
  }

  return {
    backup,
    restore,
    isBackingUp,
    isRestoring,
    error,
  }
}
