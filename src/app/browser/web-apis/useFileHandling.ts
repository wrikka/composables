import { ref } from 'vue'

export interface FileHandlingState {
  open: (options?: { multiple?: boolean; accept?: string }) => Promise<File[]>
  save: (content: string, filename: string, type?: string) => Promise<void>
  isOpening: boolean
  isSaving: boolean
  error: Error | null
}

export function useFileHandling() {
  const isOpening = ref(false)
  const isSaving = ref(false)
  const error = ref<Error | null>(null)

  const open = async (options?: { multiple?: boolean; accept?: string }): Promise<File[]> => {
    isOpening.value = true
    error.value = null

    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.multiple = options?.multiple ?? false
      if (options?.accept) {
        input.accept = options.accept
      }

      return new Promise((resolve, reject) => {
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files
          if (files) {
            resolve(Array.from(files))
          } else {
            reject(new Error('No files selected'))
          }
        }

        input.oncancel = () => {
          reject(new Error('File selection cancelled'))
        }

        input.click()
      })
    } catch (err) {
      error.value = err as Error
      return []
    } finally {
      isOpening.value = false
    }
  }

  const save = async (content: string, filename: string, type = 'text/plain'): Promise<void> => {
    isSaving.value = true
    error.value = null

    try {
      const blob = new Blob([content], { type })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      error.value = err as Error
    } finally {
      isSaving.value = false
    }
  }

  return {
    open,
    save,
    isOpening,
    isSaving,
    error,
  }
}
