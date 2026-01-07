import { ref, unref, watch, type Ref, type MaybeRef } from 'vue'

export interface UseAnimateOptions extends KeyframeAnimationOptions {
  immediate?: boolean
  commitStyles?: boolean
  onReady?: (animation: Animation) => void
  onFinish?: (animation: Animation) => void
  onError?: (e: Error) => void
}

export function useAnimate(
  target: Ref<HTMLElement | null>,
  keyframes: MaybeRef<Keyframe[] | PropertyIndexedKeyframes | null>,
  options: UseAnimateOptions = {}
) {
  const { immediate = true, commitStyles = false, onReady, onFinish, onError } = options

  const animation = ref<Animation | null>(null)
  const isPlaying = ref(false)
  const isFinished = ref(false)

  const play = () => {
    if (!target.value || !unref(keyframes)) return
    if (animation.value) {
      animation.value.play()
    } else {
      animation.value = target.value.animate(unref(keyframes), options)
      animation.value.onfinish = () => {
        isFinished.value = true
        isPlaying.value = false
        onFinish?.(animation.value!)
        if (commitStyles) {
          animation.value!.commitStyles()
        }
      }
      onReady?.(animation.value)
    }
    isPlaying.value = true
    isFinished.value = false
  }

  const pause = () => {
    animation.value?.pause()
    isPlaying.value = false
  }

  const reverse = () => {
    animation.value?.reverse()
    isPlaying.value = true
    isFinished.value = false
  }

  const finish = () => {
    animation.value?.finish()
    isPlaying.value = false
    isFinished.value = true
  }

  const cancel = () => {
    animation.value?.cancel()
    isPlaying.value = false
    isFinished.value = false
  }

  watch(
    target,
    (el) => {
      if (immediate && el) {
        try {
          play()
        } catch (e) {
          onError?.(e as Error)
        }
      }
    },
    { immediate: true }
  )

  return {
    animation,
    isPlaying,
    isFinished,
    play,
    pause,
    reverse,
    finish,
    cancel,
  }
}
