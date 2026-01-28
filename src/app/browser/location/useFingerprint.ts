import { ref } from 'vue'

export interface Fingerprint {
  userAgent: string
  language: string
  platform: string
  screenResolution: string
  colorDepth: number
  timezone: string
  sessionStorage: boolean
  localStorage: boolean
  indexedDB: boolean
  webGL: string
  canvas: string
  hash: string
}

export function useFingerprint() {
  const fingerprint = ref<Fingerprint | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  function getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx)
        return ''

      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('Hello, world!', 2, 15)
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
      ctx.fillText('Hello, world!', 4, 17)

      return canvas.toDataURL()
    }
    catch {
      return ''
    }
  }

  function getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl)
        return ''

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (!debugInfo)
        return ''

      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)

      return `${vendor}|${renderer}`
    }
    catch {
      return ''
    }
  }

  async function generateHash(str: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  async function generate() {
    isLoading.value = true
    error.value = null

    try {
      const fp: Fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        colorDepth: window.screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        sessionStorage: (() => {
          try {
            return !!window.sessionStorage
          }
          catch {
            return false
          }
        })(),
        localStorage: (() => {
          try {
            return !!window.localStorage
          }
          catch {
            return false
          }
        })(),
        indexedDB: !!window.indexedDB,
        webGL: getWebGLFingerprint(),
        canvas: getCanvasFingerprint(),
        hash: '',
      }

      const fpString = Object.values(fp).filter(v => typeof v === 'string').join('|')
      fp.hash = await generateHash(fpString)

      fingerprint.value = fp
    }
    catch (e) {
      error.value = e as Error
    }
    finally {
      isLoading.value = false
    }
  }

  generate()

  return {
    fingerprint,
    isLoading,
    error,
    generate,
  }
}
