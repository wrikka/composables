import { describe, it, expect } from 'vitest'
import { useFileReader } from './useFileReader'

describe('useFileReader', () => {
  it('should read a file as text', async () => {
    const { read, result, isLoading } = useFileReader()
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })

    read(file, 'text')
    expect(isLoading.value).toBe(true)

    // FileReader is async, we need to wait for the result
    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (!isLoading.value) {
          clearInterval(interval)
          resolve(null)
        }
      }, 10)
    })

    expect(result.value).toBe('hello')
    expect(isLoading.value).toBe(false)
  })

  it('should read a file as data URL', async () => {
    const { read, result, isLoading } = useFileReader()
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })

    read(file, 'dataURL')
    expect(isLoading.value).toBe(true)

    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (!isLoading.value) {
          clearInterval(interval)
          resolve(null)
        }
      }, 10)
    })

    expect(result.value).toBe('data:text/plain;base64,aGVsbG8=')
    expect(isLoading.value).toBe(false)
  })
})
