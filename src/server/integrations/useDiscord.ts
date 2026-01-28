import { ref, type Ref } from 'vue'

export interface UseDiscordOptions {
  token?: string
  clientId?: string
}

export interface UseDiscordReturn {
  client: any
  bot: any
  webhooks: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useDiscord(_options?: UseDiscordOptions): UseDiscordReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const client = null
  const bot = null
  const webhooks = null

  return {
    client,
    bot,
    webhooks,
    isConnected,
    isLoading,
    error,
  }
}
