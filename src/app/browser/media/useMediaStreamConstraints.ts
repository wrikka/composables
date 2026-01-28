import { ref } from 'vue'

export interface MediaStreamConstraintsState {
  constraints: MediaStreamConstraints
  audioEnabled: boolean
  videoEnabled: boolean
  audioDeviceId: string | null
  videoDeviceId: string | null
  width: number | null
  height: number | null
  frameRate: number | null
}

export function useMediaStreamConstraints() {
  const audioEnabled = ref(true)
  const videoEnabled = ref(true)
  const audioDeviceId = ref<string | null>(null)
  const videoDeviceId = ref<string | null>(null)
  const width = ref<number | null>(null)
  const height = ref<number | null>(null)
  const frameRate = ref<number | null>(null)

  const constraints = computed<MediaStreamConstraints>(() => {
    const result: MediaStreamConstraints = {}

    if (audioEnabled.value) {
      result.audio = {
        deviceId: audioDeviceId.value ? { exact: audioDeviceId.value } : undefined,
      }
    }

    if (videoEnabled.value) {
      result.video = {
        deviceId: videoDeviceId.value ? { exact: videoDeviceId.value } : undefined,
        width: width.value ? { ideal: width.value } : undefined,
        height: height.value ? { ideal: height.value } : undefined,
        frameRate: frameRate.value ? { ideal: frameRate.value } : undefined,
      }
    }

    return result
  })

  const toggleAudio = () => {
    audioEnabled.value = !audioEnabled.value
  }

  const toggleVideo = () => {
    videoEnabled.value = !videoEnabled.value
  }

  const setAudioDevice = (deviceId: string) => {
    audioDeviceId.value = deviceId
  }

  const setVideoDevice = (deviceId: string) => {
    videoDeviceId.value = deviceId
  }

  const setResolution = (w: number, h: number) => {
    width.value = w
    height.value = h
  }

  const setFrameRate = (fps: number) => {
    frameRate.value = fps
  }

  return {
    constraints,
    audioEnabled,
    videoEnabled,
    audioDeviceId,
    videoDeviceId,
    width,
    height,
    frameRate,
    toggleAudio,
    toggleVideo,
    setAudioDevice,
    setVideoDevice,
    setResolution,
    setFrameRate,
  }
}
