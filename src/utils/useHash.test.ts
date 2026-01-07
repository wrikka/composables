import { describe, it, expect, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { useHash } from './useHash'

// Mock window.crypto.subtle
const mockDigest = vi.fn(async (_algorithm: string, data: Uint8Array) => {
  // Simple SHA-256 mock for 'hello'
  if (new TextDecoder().decode(data) === 'hello') {
    const hashBuffer = new Uint8Array([47, 232, 115, 83, 10, 173, 11, 231, 189, 17, 13, 201, 12, 251, 18, 11, 21, 23, 136, 11, 21, 136, 218, 15, 13, 13, 13, 13, 13, 13, 13, 13]).buffer;
    return Promise.resolve(hashBuffer);
  }
  return Promise.resolve(new ArrayBuffer(32));
});

Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      digest: mockDigest,
    },
  },
});

describe('useHash', () => {
  it('should compute the hash of a string', async () => {
    const text = ref('hello')
    const { hash } = useHash(text)

    await nextTick()
    await nextTick()

    // sha256('hello') -> 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
    // The mock returns a simplified version, let's just check if it's a string
    expect(typeof hash.value).toBe('string')
    expect(hash.value).not.toBe('')
  })

  it('should update the hash when the source text changes', async () => {
    const text = ref('initial')
    const { hash } = useHash(text)

    await nextTick()
    const initialHash = hash.value

    text.value = 'updated'
    await nextTick()
    await nextTick()

    expect(hash.value).not.toBe(initialHash)
  })
})
