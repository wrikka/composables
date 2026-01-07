import { onMounted, onUnmounted, Ref, unref } from 'vue'

type Target = Ref<Node | null> | Node

export function useMutationObserver(
  target: Target,
  callback: MutationCallback,
  options: MutationObserverInit = {},
) {
  let observer: MutationObserver | null = null

  const start = () => {
    const targetNode = unref(target)
    if (targetNode) {
      observer = new MutationObserver(callback)
      observer.observe(targetNode, options)
    }
  }

  const stop = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onMounted(start)
  onUnmounted(stop)

  return { start, stop }
}
