import { ref } from 'vue'

export interface StorageCompressionState {
  compress: (data: string) => Promise<string>
  decompress: (compressed: string) => Promise<string>
  isCompressing: boolean
  isDecompressing: boolean
  error: Error | null
}

export function useStorageCompression() {
  const isCompressing = ref(false)
  const isDecompressing = ref(false)
  const error = ref<Error | null>(null)

  const compress = async (data: string): Promise<string> => {
    isCompressing.value = true
    error.value = null

    try {
      const blob = new Blob([data], { type: 'application/json' })
      const stream = blob.stream().pipeThrough(new CompressionStream('gzip'))
      const compressedBlob = await new Response(stream).blob()
      return compressedBlob.text()
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isCompressing.value = false
    }
  }

  const decompress = async (compressed: string): Promise<string> => {
    isDecompressing.value = true
    error.value = null

    try {
      const blob = new Blob([compressed], { type: 'application/json' })
      const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'))
      const decompressedBlob = await new Response(stream).blob()
      return decompressedBlob.text()
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isDecompressing.value = false
    }
  }

  return {
    compress,
    decompress,
    isCompressing,
    isDecompressing,
    error,
  }
}
