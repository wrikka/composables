import { ref } from 'vue'

export interface WebCodecsState {
  encodeVideo: (frame: VideoFrame) => Promise<EncodedVideoChunk | null>
  decodeVideo: (chunk: EncodedVideoChunk) => Promise<VideoFrame | null>
  isEncoding: boolean
  isDecoding: boolean
  error: Error | null
}

export function useWebCodecs() {
  const isEncoding = ref(false)
  const isDecoding = ref(false)
  const error = ref<Error | null>(null)

  const encodeVideo = async (frame: VideoFrame): Promise<EncodedVideoChunk | null> => {
    isEncoding.value = true
    error.value = null

    try {
      const encoder = new VideoEncoder({
        output: (chunk) => {
          chunk.close()
        },
        error: (err) => {
          error.value = err as Error
        },
      })

      encoder.configure({
        codec: 'avc1.42E01E',
        width: frame.width,
        height: frame.height,
        bitrate: 1000000,
        framerate: 30,
      })

      encoder.encode(frame)
      await encoder.flush()
      encoder.close()

      return null
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isEncoding.value = false
    }
  }

  const decodeVideo = async (chunk: EncodedVideoChunk): Promise<VideoFrame | null> => {
    isDecoding.value = true
    error.value = null

    try {
      const decoder = new VideoDecoder({
        output: (frame) => {
          frame.close()
        },
        error: (err) => {
          error.value = err as Error
        },
      })

      decoder.configure({
        codec: 'avc1.42E01E',
      })

      decoder.decode(chunk)
      await decoder.flush()
      decoder.close()

      return null
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isDecoding.value = false
    }
  }

  return {
    encodeVideo,
    decodeVideo,
    isEncoding,
    isDecoding,
    error,
  }
}
