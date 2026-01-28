import { tryOnScopeDispose } from '@vueuse/core'
import { ref, computed } from 'vue'

export interface UseMediaStreamOptions {
  video?: boolean | MediaTrackConstraints
  audio?: boolean | MediaTrackConstraints
}

export function useMediaStream(options: UseMediaStreamOptions = {}) {
  const isSupported = computed(() => 'mediaDevices' in navigator)
  const stream = ref<MediaStream | null>(null)
  const isActive = ref(false)
  const error = ref<Error | null>(null)

  async function start() {
    if (!isSupported.value) {
      error.value = new Error('MediaDevices API is not supported')
      return false
    }

    try {
      stream.value = await navigator.mediaDevices.getUserMedia({
        video: options.video ?? false,
        audio: options.audio ?? false,
      })
      isActive.value = true
      return true
    }
    catch (e) {
      error.value = e as Error
      return false
    }
  }

  function stop() {
    if (stream.value) {
      const tracks = stream.value.getTracks()
      tracks.forEach(track => track.stop())
      stream.value = null
      isActive.value = false
    }
  }

  function getTracks(): MediaStreamTrack[] {
    return stream.value?.getTracks() || []
  }

  function getVideoTracks(): MediaStreamTrack[] {
    return stream.value?.getVideoTracks() || []
  }

  function getAudioTracks(): MediaStreamTrack[] {
    return stream.value?.getAudioTracks() || []
  }

  tryOnScopeDispose(() => {
    stop()
  })

  return {
    isSupported,
    stream,
    isActive,
    error,
    start,
    stop,
    getTracks,
    getVideoTracks,
    getAudioTracks,
  }
}
