import { ref, onMounted, onUnmounted } from 'vue'

export interface VideoDevicesState {
  devices: MediaDeviceInfo[]
  inputDevices: MediaDeviceInfo[]
  selectedInputDevice: MediaDeviceInfo | null
}

export function useVideoDevices() {
  const devices = ref<MediaDeviceInfo[]>([])
  const inputDevices = ref<MediaDeviceInfo[]>([])
  const selectedInputDevice = ref<MediaDeviceInfo | null>(null)

  const updateDevices = async () => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices()
      devices.value = mediaDevices

      inputDevices.value = mediaDevices.filter(device => device.kind === 'videoinput')

      if (inputDevices.value.length > 0 && !selectedInputDevice.value) {
        selectedInputDevice.value = inputDevices.value[0]
      }
    } catch (error) {
      console.error('Failed to enumerate video devices:', error)
    }
  }

  const selectInputDevice = (device: MediaDeviceInfo) => {
    selectedInputDevice.value = device
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
    selectedInputDevice,
    selectInputDevice,
  }
}
