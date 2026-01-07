import { ref, computed } from 'vue'

export interface UseColorOptions {
  format?: 'hex' | 'rgb' | 'hsl'
}

export function useColor(initialColor: string, options: UseColorOptions = {}) {
  const { format = 'hex' } = options
  const color = ref(initialColor)

  const hex = computed(() => {
    // Convert any format to hex
    if (color.value.startsWith('#')) return color.value
    if (color.value.startsWith('rgb')) return rgbToHex(color.value)
    if (color.value.startsWith('hsl')) return hslToHex(color.value)
    return color.value
  })

  const rgb = computed(() => {
    if (color.value.startsWith('#')) return hexToRgb(color.value)
    if (color.value.startsWith('rgb')) return color.value
    if (color.value.startsWith('hsl')) return hslToRgb(color.value)
    return hexToRgb(color.value)
  })

  const hsl = computed(() => {
    if (color.value.startsWith('#')) return hexToHsl(color.value)
    if (color.value.startsWith('rgb')) return rgbToHsl(color.value)
    if (color.value.startsWith('hsl')) return color.value
    return hexToHsl(color.value)
  })

  const formatted = computed(() => {
    switch (format) {
      case 'hex': return hex.value
      case 'rgb': return rgb.value
      case 'hsl': return hsl.value
      default: return hex.value
    }
  })

  const setColor = (newColor: string) => {
    color.value = newColor
  }

  const setHex = (hexColor: string) => {
    color.value = hexColor
  }

  const setRgb = (rgbColor: string) => {
    color.value = rgbToHex(rgbColor)
  }

  const setHsl = (hslColor: string) => {
    color.value = hslToHex(hslColor)
  }

  return {
    color,
    hex,
    rgb,
    hsl,
    formatted,
    setColor,
    setHex,
    setRgb,
    setHsl
  }
}

// Helper functions
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return 'rgb(0, 0, 0)'
  
  const r = parseInt(result[1]!, 16)
  const g = parseInt(result[2]!, 16)
  const b = parseInt(result[3]!, 16)
  
  return `rgb(${r}, ${g}, ${b})`
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/\d+/g)
  if (!match) return '#000000'
  
  const r = parseInt(match[0]!)
  const g = parseInt(match[1]!)
  const b = parseInt(match[2]!)
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function hexToHsl(hex: string): string {
  const rgbMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!rgbMatch) return 'hsl(0, 0%, 0%)'
  
  let r = parseInt(rgbMatch[1] as string, 16) / 255
  let g = parseInt(rgbMatch[2] as string, 16) / 255
  let b = parseInt(rgbMatch[3] as string, 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

function rgbToHsl(rgb: string): string {
  return hexToHsl(rgbToHex(rgb))
}

function hslToRgb(hsl: string): string {
  const match = hsl.match(/\d+/g)
  if (!match) return 'rgb(0, 0, 0)'
  
  let h = parseInt(match[0] as string, 10) / 360
  let s = parseInt(match[1] as string, 10) / 100
  let l = parseInt(match[2] as string, 10) / 100
  
  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
}

function hslToHex(hsl: string): string {
  return rgbToHex(hslToRgb(hsl))
}
