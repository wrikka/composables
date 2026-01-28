import { tryOnScopeDispose } from '@vueuse/core'
import { ref, computed } from 'vue'

export interface UseAudioRecordingOptions {
  mimeType?: string
  audioBitsPerSecond?: number
}

export function useAudioRecording(options: UseAudioRecordingOptions = {}) {
  const isSupported = computed(() => 'MediaRecorder' in window)
  const isRecording = ref(false)
  const stream = ref<MediaStream | null>(null)
  const chunks = ref<Blob[]>([])
  const error = ref<Error | null>(null)

  async function start() {
    if (!isSupported.value) {
      error.value = new Error('MediaRecorder is not supported')
      return false
    }

    try {
      stream.value = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = options.mimeType || MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'

      const mediaRecorder = new MediaRecorder(stream.value, {
        mimeType,
        audioBitsPerSecond: options.audioBitsPerSecond,
      })

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.value.push(e.data)
        }
      }

      mediaRecorder.start()
      isRecording.value = true

      return true
    }
    catch (e) {
      error.value = e as Error
      return false
    }
  }

  async function stop(): Promise<Blob | null> {
    if (!stream.value || !isRecording.value) {
      return null
    }

    return new Promise((resolve) => {
      const tracks = stream.value!.getTracks()
      tracks.forEach(track => track.stop())

      isRecording.value = false
      stream.value = null

      const blob = new Blob(chunks.value, { type: options.mimeType || 'audio/webm' })
      chunks.value = []
      resolve(blob)
    })
  }

  function pause() {
    if (stream.value) {
      const tracks = stream.value.getAudioTracks()
      tracks.forEach(track => track.enabled = false)
    }
  }

  function resume() {
    if (stream.value) {
      const tracks = stream.value.getAudioTracks()
      tracks.forEach(track => track.enabled = true)
    }
  }

  tryOnScopeDispose(() => {
    if (isRecording.value) {
      stop()
    }
  })

  return {
    isSupported,
    isRecording,
    stream,
    chunks,
    error,
    start,
    stop,
    pause,
    resume,
  }
}
