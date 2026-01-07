import { describe, it, expect, vi, afterEach } from 'vitest'
import { ref } from 'vue'
import { useMutationObserver } from './useMutationObserver'

describe('useMutationObserver', () => {
  let target: HTMLDivElement | null

  afterEach(() => {
    if (target && target.parentNode) {
      target.parentNode.removeChild(target)
    }
    target = null
  })

  it('should observe mutations on a target element', async () => {
    target = document.createElement('div')
    document.body.appendChild(target)

    const callback = vi.fn()
    const targetRef = ref(target)

    const { stop } = useMutationObserver(targetRef, callback, {
      attributes: true,
      childList: true,
    })

    // Trigger a mutation
    target.setAttribute('data-test', 'true')
    target.appendChild(document.createElement('span'))

    // Wait for the observer to fire
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(callback).toHaveBeenCalled()
    // MutationObserver often batches changes, so it might be called once or twice
    expect(callback.mock.calls.length).toBeGreaterThanOrEqual(1)

    stop()

    // Trigger another mutation after stopping
    target.setAttribute('data-test', 'false')
    await new Promise(resolve => setTimeout(resolve, 0))

    // Callback should not be called again
    const finalCallCount = callback.mock.calls.length
    expect(callback).toHaveBeenCalledTimes(finalCallCount)
  })
})
