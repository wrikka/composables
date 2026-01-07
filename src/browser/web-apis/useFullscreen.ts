import { ref, onMounted, onUnmounted } from 'vue'

export interface FullscreenOptions {
  onEnter?: () => void
  onExit?: () => void
  onError?: (error: string) => void
}

export function useFullscreen(options: FullscreenOptions = {}) {
  const { onEnter, onExit, onError } = options

  const isSupported = ref(!!document.fullscreenEnabled)
  const isActive = ref(false)
  const element = ref<Element | null>(null)
  const error = ref<string | null>(null)

  const getFullscreenElement = (): Element | null => {
    return document.fullscreenElement || 
           (document as any).webkitFullscreenElement || 
           (document as any).mozFullScreenElement || 
           (document as any).msFullscreenElement || 
           null
  }

  const requestFullscreen = (targetElement?: Element): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!isSupported.value) {
        const errorMsg = 'Fullscreen API is not supported'
        error.value = errorMsg
        onError?.(errorMsg)
        resolve(false)
        return
      }

      const elem = targetElement || document.documentElement
      element.value = elem

      const requestMethod = elem.requestFullscreen || 
                          (elem as any).webkitRequestFullscreen || 
                          (elem as any).mozRequestFullScreen || 
                          (elem as any).msRequestFullscreen

      if (requestMethod) {
        try {
          const request = requestMethod.call(elem)
          
          if (request instanceof Promise) {
            request
              .then(() => {
                isActive.value = true
                error.value = null
                onEnter?.()
                resolve(true)
              })
              .catch((err) => {
                const errorMsg = `Failed to enter fullscreen: ${err.message}`
                error.value = errorMsg
                onError?.(errorMsg)
                resolve(false)
              })
          } else {
            // Legacy API
            isActive.value = true
            error.value = null
            onEnter?.()
            resolve(true)
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error'
          error.value = errorMsg
          onError?.(errorMsg)
          resolve(false)
        }
      } else {
        const errorMsg = 'Fullscreen request method not found'
        error.value = errorMsg
        onError?.(errorMsg)
        resolve(false)
      }
    })
  }

  const exitFullscreen = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!isSupported.value) {
        const errorMsg = 'Fullscreen API is not supported'
        error.value = errorMsg
        onError?.(errorMsg)
        resolve(false)
        return
      }

      const exitMethod = document.exitFullscreen || 
                        (document as any).webkitExitFullscreen || 
                        (document as any).mozCancelFullScreen || 
                        (document as any).msExitFullscreen

      if (exitMethod) {
        try {
          const request = exitMethod.call(document)
          
          if (request instanceof Promise) {
            request
              .then(() => {
                isActive.value = false
                element.value = null
                error.value = null
                onExit?.()
                resolve(true)
              })
              .catch((err) => {
                const errorMsg = `Failed to exit fullscreen: ${err.message}`
                error.value = errorMsg
                onError?.(errorMsg)
                resolve(false)
              })
          } else {
            // Legacy API
            isActive.value = false
            element.value = null
            error.value = null
            onExit?.()
            resolve(true)
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error'
          error.value = errorMsg
          onError?.(errorMsg)
          resolve(false)
        }
      } else {
        const errorMsg = 'Fullscreen exit method not found'
        error.value = errorMsg
        onError?.(errorMsg)
        resolve(false)
      }
    })
  }

  const toggle = (targetElement?: Element): Promise<boolean> => {
    if (isActive.value) {
      return exitFullscreen()
    } else {
      return requestFullscreen(targetElement)
    }
  }

  const isFullscreen = (): boolean => {
    return !!getFullscreenElement()
  }

  const updateState = () => {
    const fullscreenElement = getFullscreenElement()
    isActive.value = !!fullscreenElement
    element.value = fullscreenElement
  }

  const handleFullscreenChange = () => {
    updateState()
    
    if (isActive.value) {
      onEnter?.()
    } else {
      onExit?.()
    }
  }

  const handleFullscreenError = (event: Event) => {
    const errorMsg = `Fullscreen error: ${(event as any).message || 'Unknown fullscreen error'}`
    error.value = errorMsg
    onError?.(errorMsg)
    isActive.value = false
    element.value = null
  }

  onMounted(() => {
    updateState()
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)
    
    document.addEventListener('fullscreenerror', handleFullscreenError)
    document.addEventListener('webkitfullscreenerror', handleFullscreenError)
    document.addEventListener('mozfullscreenerror', handleFullscreenError)
    document.addEventListener('MSFullscreenError', handleFullscreenError)
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    
    document.removeEventListener('fullscreenerror', handleFullscreenError)
    document.removeEventListener('webkitfullscreenerror', handleFullscreenError)
    document.removeEventListener('mozfullscreenerror', handleFullscreenError)
    document.removeEventListener('MSFullscreenError', handleFullscreenError)
  })

  return {
    isSupported,
    isActive,
    element,
    error,
    requestFullscreen,
    exitFullscreen,
    toggle,
    isFullscreen,
    updateState
  }
}

// Picture-in-Picture helper
export function usePictureInPicture() {
  const isSupported = ref(!!document.pictureInPictureEnabled)
  const isActive = ref(false)
  const video = ref<HTMLVideoElement | null>(null)
  const error = ref<string | null>(null)

  const requestPiP = async (videoElement: HTMLVideoElement): Promise<boolean> => {
    if (!isSupported.value) {
      error.value = 'Picture-in-Picture is not supported'
      return false
    }

    try {
      await videoElement.requestPictureInPicture()
      video.value = videoElement
      isActive.value = true
      error.value = null
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'PiP request failed'
      return false
    }
  }

  const exitPiP = async (): Promise<boolean> => {
    if (!document.pictureInPictureElement) {
      return true
    }

    try {
      await document.exitPictureInPicture()
      isActive.value = false
      video.value = null
      error.value = null
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'PiP exit failed'
      return false
    }
  }

  const togglePiP = async (videoElement: HTMLVideoElement): Promise<boolean> => {
    if (isActive.value) {
      return exitPiP()
    } else {
      return requestPiP(videoElement)
    }
  }

  const handlePiPChange = () => {
    isActive.value = !!document.pictureInPictureElement
    video.value = document.pictureInPictureElement as HTMLVideoElement || null
  }

  onMounted(() => {
    video.value = document.pictureInPictureElement as HTMLVideoElement || null
    isActive.value = !!video.value

    document.addEventListener('enterpictureinpicture', handlePiPChange)
    document.addEventListener('leavepictureinpicture', handlePiPChange)
  })

  onUnmounted(() => {
    document.removeEventListener('enterpictureinpicture', handlePiPChange)
    document.removeEventListener('leavepictureinpicture', handlePiPChange)
  })

  return {
    isSupported,
    isActive,
    video,
    error,
    requestPiP,
    exitPiP,
    togglePiP
  }
}
