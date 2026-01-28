import { describe, it, expect } from 'vitest'
import { useMediaStreamConstraints } from './useMediaStreamConstraints'

describe('useMediaStreamConstraints', () => {
  it('should return media stream constraints', () => {
    const { constraints, audioEnabled, videoEnabled } = useMediaStreamConstraints()

    expect(constraints.value).toBeDefined()
    expect(audioEnabled.value).toBe(true)
    expect(videoEnabled.value).toBe(true)
  })

  it('should toggle audio', () => {
    const { toggleAudio, audioEnabled } = useMediaStreamConstraints()

    toggleAudio()

    expect(audioEnabled.value).toBe(false)
  })

  it('should toggle video', () => {
    const { toggleVideo, videoEnabled } = useMediaStreamConstraints()

    toggleVideo()

    expect(videoEnabled.value).toBe(false)
  })

  it('should set audio device', () => {
    const { setAudioDevice, audioDeviceId } = useMediaStreamConstraints()

    setAudioDevice('device-123')

    expect(audioDeviceId.value).toBe('device-123')
  })

  it('should set video device', () => {
    const { setVideoDevice, videoDeviceId } = useMediaStreamConstraints()

    setVideoDevice('device-456')

    expect(videoDeviceId.value).toBe('device-456')
  })

  it('should set resolution', () => {
    const { setResolution, width, height } = useMediaStreamConstraints()

    setResolution(1920, 1080)

    expect(width.value).toBe(1920)
    expect(height.value).toBe(1080)
  })

  it('should set frame rate', () => {
    const { setFrameRate, frameRate } = useMediaStreamConstraints()

    setFrameRate(30)

    expect(frameRate.value).toBe(30)
  })
})
