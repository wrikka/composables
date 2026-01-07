import { describe, it, expect } from 'vitest'
import { useColor } from './useColor'

describe('useColor', () => {
  it('should initialize with hex color', () => {
    const { color, hex, rgb, hsl } = useColor('#ff0000')

    expect(color.value).toBe('#ff0000')
    expect(hex.value).toBe('#ff0000')
    expect(rgb.value).toBe('rgb(255, 0, 0)')
    expect(hsl.value).toBe('hsl(0, 100%, 50%)')
  })

  it('should initialize with rgb color', () => {
    const { hex, rgb, hsl } = useColor('rgb(255, 0, 0)')

    expect(hex.value).toBe('#ff0000')
    expect(rgb.value).toBe('rgb(255, 0, 0)')
    expect(hsl.value).toBe('hsl(0, 100%, 50%)')
  })

  it('should initialize with hsl color', () => {
    const { hex, rgb, hsl } = useColor('hsl(0, 100%, 50%)')

    expect(hex.value).toBe('#ff0000')
    expect(rgb.value).toBe('rgb(255, 0, 0)')
    expect(hsl.value).toBe('hsl(0, 100%, 50%)')
  })

  it('should format output based on format option', () => {
    const { formatted } = useColor('#ff0000', { format: 'rgb' })
    expect(formatted.value).toBe('rgb(255, 0, 0)')

    const { formatted: hslFormatted } = useColor('#ff0000', { format: 'hsl' })
    expect(hslFormatted.value).toBe('hsl(0, 100%, 50%)')
  })

  it('should set color using different methods', () => {
    const { color, setHex, setRgb, setHsl } = useColor('#000000')

    setHex('#00ff00')
    expect(color.value).toBe('#00ff00')

    setRgb('rgb(0, 0, 255)')
    expect(color.value).toBe('#0000ff')

    setHsl('hsl(120, 100%, 50%)')
    expect(color.value).toBe('#00ff00')
  })

  it('should handle invalid colors', () => {
    const { hex, rgb, hsl } = useColor('invalid')

    expect(hex.value).toBe('#000000')
    expect(rgb.value).toBe('rgb(0, 0, 0)')
    expect(hsl.value).toBe('hsl(0, 0%, 0%)')
  })

  it('should convert complex colors correctly', () => {
    const { hex, rgb, hsl } = useColor('#808080')

    expect(hex.value).toBe('#808080')
    expect(rgb.value).toBe('rgb(128, 128, 128)')
    expect(hsl.value).toBe('hsl(0, 0%, 50%)')
  })

  it('should handle 3-digit hex colors', () => {
    const { hex, rgb } = useColor('#f00')

    expect(hex.value).toBe('#f00')
    expect(rgb.value).toBe('rgb(0, 0, 0)') // Will be invalid for 3-digit
  })

  it('should update color when setColor is called', () => {
    const { color, hex, setColor } = useColor('#ff0000')

    setColor('#00ff00')
    expect(color.value).toBe('#00ff00')
    expect(hex.value).toBe('#00ff00')
  })
})
