import { unref, type Ref } from 'vue'
import { useEventListener } from '../../ui/component/useEventListener'

export function useOnClickOutside(
  target: Ref<HTMLElement | null | undefined> | HTMLElement,
  handler: (evt: MouseEvent) => void
) {
  const listener = (event: MouseEvent) => {
    const targetEl = unref(target)
    if (!targetEl || targetEl.contains(event.target as Node)) {
      return
    }
    handler(event)
  }

  return useEventListener(window, 'click', listener as EventListener)
}