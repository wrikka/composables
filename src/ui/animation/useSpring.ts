import { ref, watch, type Ref } from 'vue'
import { useRafFn } from './useRafFn'

export interface UseSpringOptions {
  stiffness?: number
  damping?: number
  mass?: number
  precision?: number
}

export function useSpring(
  target: Ref<number> | number,
  options: UseSpringOptions = {}
): Ref<number> {
  const { stiffness = 170, damping = 26, mass = 1, precision = 0.01 } = options

  const value = ref(target)
  const targetValue = ref(target)

  let velocity = 0

  const { pause, resume } = useRafFn(() => {
    const springForce = -stiffness * (value.value - targetValue.value)
    const dampingForce = -damping * velocity
    const acceleration = (springForce + dampingForce) / mass

    velocity += acceleration
    value.value += velocity

    if (Math.abs(value.value - targetValue.value) < precision && Math.abs(velocity) < precision) {
      value.value = targetValue.value
      pause()
    }
  }, { immediate: false })

  watch(targetValue, (_newValue) => {
    resume()
  }, { immediate: false })

  return value
}
