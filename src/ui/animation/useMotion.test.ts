import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useMotion } from './useMotion'

// Mock useSpring
vi.mock('./useSpring', () => ({
  useSpring: vi.fn((value) => value) // Return the computed value directly
}))

describe('useMotion', () => {
  it('should generate correct style object', () => {
    const target = ref(document.createElement('div'))
    const initial = { x: 10, y: 20, scale: 1.5, opacity: 0.5, rotate: 45 }
    const { style } = useMotion(target, initial)

    expect(style.value.transform).toBe('translateX(10px) translateY(20px) scale(1.5) rotate(45deg)')
    expect(style.value.opacity).toBe(0.5)
  })

  it('should update styles when properties are changed via set()', () => {
    const target = ref(document.createElement('div'))
    const initial = ref({ x: 0, opacity: 1 })
    const { style, set } = useMotion(target, initial)

    expect(style.value.transform).toBe('translateX(0px)')
    expect(style.value.opacity).toBe(1)

    set({ x: 100, opacity: 0 })

    expect(style.value.transform).toBe('translateX(100px)')
    expect(style.value.opacity).toBe(0)
  })

  it('should apply styles to the target element', async () => {
    const el = document.createElement('div')
    const target = ref<HTMLElement | null>(null)
    const { set } = useMotion(target, { x: 0 })

    target.value = el
    await new Promise(resolve => setTimeout(resolve, 0)) // wait for watch to trigger

    set({ x: 50, opacity: 0.5 })
    await new Promise(resolve => setTimeout(resolve, 0)) // wait for style watch to trigger

    expect(el.style.transform).toBe('translateX(50px)')
    expect(el.style.opacity).toBe('0.5')
  })
})
