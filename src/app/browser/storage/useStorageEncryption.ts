import { ref } from 'vue'

export interface StorageEncryptionState {
  encrypt: (data: string, key: string) => Promise<string>
  decrypt: (encrypted: string, key: string) => Promise<string>
  isEncrypting: boolean
  isDecrypting: boolean
  error: Error | null
}

export function useStorageEncryption() {
  const isEncrypting = ref(false)
  const isDecrypting = ref(false)
  const error = ref<Error | null>(null)

  const encrypt = async (data: string, key: string): Promise<string> => {
    isEncrypting.value = true
    error.value = null

    try {
      const encoder = new TextEncoder()
      const keyData = encoder.encode(key)
      const dataBytes = encoder.encode(data)

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      )

      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        dataBytes
      )

      const combined = new Uint8Array(iv.length + encrypted.byteLength)
      combined.set(iv)
      combined.set(new Uint8Array(encrypted), iv.length)

      return btoa(String.fromCharCode(...combined))
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isEncrypting.value = false
    }
  }

  const decrypt = async (encrypted: string, key: string): Promise<string> => {
    isDecrypting.value = true
    error.value = null

    try {
      const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))
      const iv = combined.slice(0, 12)
      const data = combined.slice(12)

      const encoder = new TextEncoder()
      const keyData = encoder.encode(key)

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      )

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data
      )

      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isDecrypting.value = false
    }
  }

  return {
    encrypt,
    decrypt,
    isEncrypting,
    isDecrypting,
    error,
  }
}
