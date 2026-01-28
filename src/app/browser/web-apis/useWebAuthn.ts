import { ref } from 'vue'

export interface WebAuthnState {
  register: (username: string, options?: CredentialCreationOptions) => Promise<Credential | null>
  authenticate: (username: string, options?: CredentialRequestOptions) => Promise<Credential | null>
  isRegistering: boolean
  isAuthenticating: boolean
  error: Error | null
}

export function useWebAuthn() {
  const isRegistering = ref(false)
  const isAuthenticating = ref(false)
  const error = ref<Error | null>(null)

  const register = async (username: string, options?: CredentialCreationOptions): Promise<Credential | null> => {
    isRegistering.value = true
    error.value = null

    try {
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32),
        rp: {
          name: 'My App',
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array(16),
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
        },
        ...options,
      }

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })

      return credential
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isRegistering.value = false
    }
  }

  const authenticate = async (username: string, options?: CredentialRequestOptions): Promise<Credential | null> => {
    isAuthenticating.value = true
    error.value = null

    try {
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: new Uint8Array(32),
        allowCredentials: [],
        userVerification: 'preferred',
        ...options,
      }

      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      })

      return credential
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isAuthenticating.value = false
    }
  }

  return {
    register,
    authenticate,
    isRegistering,
    isAuthenticating,
    error,
  }
}
