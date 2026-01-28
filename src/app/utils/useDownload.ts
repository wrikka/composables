import { ref } from 'vue'

export interface DownloadOptions {
  filename?: string
  type?: string
}

export function useDownload() {
  const isDownloading = ref(false)
  const error = ref<Error | null>(null)

  const download = async (content: string | Blob, options: DownloadOptions = {}): Promise<void> => {
    isDownloading.value = true
    error.value = null

    try {
      const blob = content instanceof Blob ? content : new Blob([content], { type: options.type || 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = options.filename || 'download'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      error.value = err as Error
    } finally {
      isDownloading.value = false
    }
  }

  return {
    isDownloading,
    error,
    download,
  }
}
