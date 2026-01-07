import { ref, unref, type Ref, type MaybeRef } from 'vue'

export interface UseStaggerOptions extends KeyframeAnimationOptions {
  stagger?: number
}

export function useStagger(
  targets: Ref<(HTMLElement | null)[]>,
  keyframes: MaybeRef<Keyframe[] | PropertyIndexedKeyframes | null>,
  options: UseStaggerOptions = {}
) {
  const { stagger = 100, ...animateOptions } = options
  const animations = ref<Animation[]>([])

  const play = () => {
    cancel()
    const newAnimations: Animation[] = []
    targets.value.forEach((el, i) => {
      if (!el) return
      const anim = el.animate(unref(keyframes), {
        ...animateOptions,
        delay: (animateOptions.delay || 0) + i * stagger,
      })
      newAnimations.push(anim)
    })
    animations.value = newAnimations
  }

  const pause = () => {
    animations.value.forEach((anim) => anim.pause())
  }

  const finish = () => {
    animations.value.forEach((anim) => anim.finish())
  }

  const cancel = () => {
    animations.value.forEach((anim) => anim.cancel())
    animations.value = []
  }

  return { animations, play, pause, finish, cancel }
}
