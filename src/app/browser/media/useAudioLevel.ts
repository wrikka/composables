import { ref, onMounted, onUnmounted } from 'vue'

export interface AudioLevelState {
  inputLevel: number | null
  outputLevel: number | null
  isMonitoring: boolean
}

export function useAudioLevel() {
  const inputLevel = ref<number | null>(null)
  const outputLevel = ref<number | null>(null)
  const isMonitoring = ref(false)

  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let microphone: MediaStream | null = null
  let animationFrameId: number | null = null

  const startMonitoring = async () => {
    try {
      audioContext = new AudioContext()
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 256

      microphone = await navigator.mediaDevices.getUserMedia({ audio: true })
      const source = audioContext.createMediaStreamSource(microphone)
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateLevel = () => {
        if (analyser) {
          analyser.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          inputLevel.value = average / 255
          outputLevel.value = average / 255
          animationFrameId = requestAnimationFrame(updateLevel)
        }
      }

      updateLevel()
      isMonitoring.value = true
    } catch (error) {
      console.error('Failed to start audio level monitoring:', error)
    }
  }

  const stopMonitoring = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    if (microphone) {
      microphone.getTracks().forEach(track => track.stop())
      microphone = null
    }

    if (audioContext) {
      audioContext.close()
      audioContext = null
    }

    analyser = null
    isMonitoring.value = false
  }

  onMounted(() => {
    startMonitoring()
  })

  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    inputLevel,
    outputLevel,
    isMonitoring,
  }
}
