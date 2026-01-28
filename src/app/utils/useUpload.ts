import { ref } from 'vue'

export interface UploadOptions {
  accept?: string
  multiple?: boolean
}

export function useUpload() {
  const isUploading = ref(false)
  const error = ref<Error | null>(null)
  const files = ref<File[]>([])

  const upload = async (options: UploadOptions = {}): Promise<File[]> => {
    isUploading.value = true
    error.value = null

    try {
      return new Promise((resolve, reject) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = options.multiple ?? false
        if (options.accept) {
          input.accept = options.accept
        }

        input.onchange = (e) => {
          const selectedFiles = (e.target as HTMLInputElement).files
          if (selectedFiles) {
            files.value = Array.from(selectedFiles)
            resolve(files.value)
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
      isUploading.value = false
    }
  }

  const clear = () => {
    files.value = []
  }

  return {
    isUploading,
    error,
    files,
    upload,
    clear,
  }
}
