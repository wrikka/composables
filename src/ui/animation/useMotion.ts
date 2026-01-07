import { ref, computed, watch, type Ref, type MaybeRef } from 'vue'
import { useSpring, type UseSpringOptions } from './useSpring'

export type MotionProperties = {
  x?: number
  y?: number
  scale?: number
  opacity?: number
  rotate?: number
}

export function useMotion(
  target: Ref<HTMLElement | null>,
  initialProperties: MaybeRef<MotionProperties>,
  springOptions: UseSpringOptions = {}
) {
  const properties = ref(initialProperties)

  const motionRefs: { [key in keyof MotionProperties]: Ref<number> } = {}
  for (const key in properties.value) {
    motionRefs[key as keyof MotionProperties] = useSpring(
      computed(() => properties.value[key as keyof MotionProperties] || 0),
      springOptions
    )
  }

  const style = computed(() => {
    const transforms = []
    if (motionRefs.x) transforms.push(`translateX(${motionRefs.x.value}px)`)
    if (motionRefs.y) transforms.push(`translateY(${motionRefs.y.value}px)`)
    if (motionRefs.scale) transforms.push(`scale(${motionRefs.scale.value})`)
    if (motionRefs.rotate) transforms.push(`rotate(${motionRefs.rotate.value}deg)`)

    return {
      transform: transforms.join(' '),
      opacity: motionRefs.opacity ? motionRefs.opacity.value : undefined,
    }
  })

  watch(
    target,
    (el) => {
      if (el) {
        watch(style, (newStyle) => {
          el.style.transform = newStyle.transform
          if (newStyle.opacity !== undefined) {
            el.style.opacity = `${newStyle.opacity}`
          }
        }, { immediate: true })
      }
    },
    { immediate: true }
  )

  const set = (newProperties: MotionProperties) => {
    properties.value = { ...properties.value, ...newProperties }
  }

  return { style, set }
}
