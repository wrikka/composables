import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useParallax } from './useParallax'

// Mock useMouse
const mockMouseX = ref(0)
const mockMouseY = ref(0)
vi.mock('../ui/interactions/useMouse', () => ({
  useMouse: vi.fn(() => ({ x: mockMouseX, y: mockMouseY, sourceType: ref('mouse') }))
}))


describe('useParallax', () => {
  it('should calculate roll and tilt based on mouse position within window', () => {
    const { roll, tilt } = useParallax()

    // Mock window size
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 })
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 600 })

    // Center
    mockMouseX.value = 400
    mockMouseY.value = 300
    expect(roll.value).toBe(0)
    expect(tilt.value).toBe(0)

    // Top-left
    mockMouseX.value = 0
    mockMouseY.value = 0
    expect(roll.value).toBe(-1)
    expect(tilt.value).toBe(-1)

    // Bottom-right
    mockMouseX.value = 800
    mockMouseY.value = 600
    expect(roll.value).toBe(1)
    expect(tilt.value).toBe(1)
  })

  it('should calculate roll and tilt based on mouse position within a target element', () => {
    const target = ref(document.createElement('div'))
    vi.spyOn(target.value, 'getBoundingClientRect').mockReturnValue({ 
      left: 100, top: 100, width: 200, height: 200 
    } as DOMRect)

    const { roll, tilt } = useParallax({ target })

    // Center of element
    mockMouseX.value = 200 // 100 (left) + 100 (width/2)
    mockMouseY.value = 200 // 100 (top) + 100 (height/2)
    expect(roll.value).toBe(0)
    expect(tilt.value).toBe(0)

    // Top-left of element
    mockMouseX.value = 100
    mockMouseY.value = 100
    expect(roll.value).toBe(-1)
    expect(tilt.value).toBe(-1)

    // Bottom-right of element
    mockMouseX.value = 300
    mockMouseY.value = 300
    expect(roll.value).toBe(1)
    expect(tilt.value).toBe(1)
  })
})
