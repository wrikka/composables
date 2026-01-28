import { ref } from 'vue'

export interface WebTransportState {
  connect: (url: string) => Promise<WebTransport | null>
  disconnect: () => void
  isConnected: boolean
  isConnecting: boolean
  error: Error | null
}

export function useWebTransport() {
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const error = ref<Error | null>(null)
  let transport: WebTransport | null = null

  const connect = async (url: string): Promise<WebTransport | null> => {
    isConnecting.value = true
    error.value = null

    try {
      transport = new WebTransport(url)
      await transport.ready
      isConnected.value = true
      return transport
    } catch (err) {
      error.value = err as Error
      isConnected.value = false
      return null
    } finally {
      isConnecting.value = false
    }
  }

  const disconnect = () => {
    if (transport) {
      transport.close()
      transport = null
      isConnected.value = false
    }
  }

  return {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    error,
  }
}
