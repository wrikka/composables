import { ref, onMounted, onUnmounted } from 'vue'

export interface AudioDevicesState {
  devices: MediaDeviceInfo[]
  inputDevices: MediaDeviceInfo[]
  outputDevices: MediaDeviceInfo[]
  selectedInputDevice: MediaDeviceInfo | null
  selectedOutputDevice: MediaDeviceInfo | null
}

export function useAudioDevices() {
  const devices = ref<MediaDeviceInfo[]>([])
  const inputDevices = ref<MediaDeviceInfo[]>([])
  const outputDevices = ref<MediaDeviceInfo[]>([])
  const selectedInputDevice = ref<MediaDeviceInfo | null>(null)
  const selectedOutputDevice = ref<MediaDeviceInfo | null>(null)

  const updateDevices = async () => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices()
      devices.value = mediaDevices

      inputDevices.value = mediaDevices.filter(device => device.kind === 'audioinput')
      outputDevices.value = mediaDevices.filter(device => device.kind === 'audiooutput')

      if (inputDevices.value.length > 0 && !selectedInputDevice.value) {
        selectedInputDevice.value = inputDevices.value[0]
      }

      if (outputDevices.value.length > 0 && !selectedOutputDevice.value) {
        selectedOutputDevice.value = outputDevices.value[0]
      }
    } catch (error) {
      console.error('Failed to enumerate audio devices:', error)
    }
  }

  const selectInputDevice = (device: MediaDeviceInfo) => {
    selectedInputDevice.value = device
  }

  const selectOutputDevice = (device: MediaDeviceInfo) => {
    selectedOutputDevice.value = device
  }

  let deviceChangeListener: ((event: Event) => void) | null = null

  onMounted(async () => {
    await updateDevices()

    deviceChangeListener = () => {
      updateDevices()
    }

    navigator.mediaDevices.addEventListener('devicechange', deviceChangeListener)
  })

  onUnmounted(() => {
    if (deviceChangeListener) {
      navigator.mediaDevices.removeEventListener('devicechange', deviceChangeListener)
    }
  })

  return {
    devices,
    inputDevices,
    outputDevices,
    selectedInputDevice,
    selectedOutputDevice,
    selectInputDevice,
    selectOutputDevice,
  }
}
