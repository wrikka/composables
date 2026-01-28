import { ref, computed, readonly, type Ref } from 'vue'

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role?: string
  permissions?: string[]
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: Error | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name?: string
}

export interface UseAuthOptions {
  tokenStorage?: 'localStorage' | 'sessionStorage' | 'memory'
  autoRefresh?: boolean
  refreshThreshold?: number
  apiEndpoints?: {
    login: string
    register: string
    refresh: string
    logout: string
    me: string
  }
}

export function useAuth(options: UseAuthOptions = {}) {
  const {
    tokenStorage = 'localStorage',
    _autoRefresh = true,
    _refreshThreshold = 300, // 5 minutes
    apiEndpoints = {
      login: '/api/auth/login',
      register: '/api/auth/register',
      refresh: '/api/auth/refresh',
      logout: '/api/auth/logout',
      me: '/api/auth/me'
    }
  } = options

  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Storage management
  const storage = tokenStorage === 'localStorage' ? localStorage : sessionStorage

  const getStoredToken = () => {
    if (tokenStorage === 'memory') return null
    try {
      return storage.getItem('auth_token')
    } catch {
      return null
    }
  }

  const setStoredToken = (newToken: string | null) => {
    if (tokenStorage === 'memory') return
    try {
      if (newToken) {
        storage.setItem('auth_token', newToken)
      } else {
        storage.removeItem('auth_token')
      }
    } catch {
      // Ignore storage errors
    }
  }

  const getStoredUser = () => {
    if (tokenStorage === 'memory') return null
    try {
      const userData = storage.getItem('auth_user')
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }

  const setStoredUser = (userData: User | null) => {
    if (tokenStorage === 'memory') return
    try {
      if (userData) {
        storage.setItem('auth_user', JSON.stringify(userData))
      } else {
        storage.removeItem('auth_user')
      }
    } catch {
      // Ignore storage errors
    }
  }

  // Initialize from storage
  const initialize = () => {
    const storedToken = getStoredToken()
    const storedUser = getStoredUser()
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = storedUser
    }
  }

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(apiEndpoints.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      
      token.value = data.token
      user.value = data.user
      
      setStoredToken(data.token)
      setStoredUser(data.user)

      return data

    } catch (err) {
      error.value = err as Error
      throw err

    } finally {
      loading.value = false
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(apiEndpoints.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      const data = await response.json()
      
      token.value = data.token
      user.value = data.user
      
      setStoredToken(data.token)
      setStoredUser(data.user)

      return data

    } catch (err) {
      error.value = err as Error
      throw err

    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true

    try {
      if (token.value) {
        await fetch(apiEndpoints.logout, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token.value}` }
        })
      }
    } catch {
      // Ignore logout errors
    } finally {
      token.value = null
      user.value = null
      error.value = null
      
      setStoredToken(null)
      setStoredUser(null)
      loading.value = false
    }
  }

  const refreshToken = async () => {
    if (!token.value) return

    try {
      const response = await fetch(apiEndpoints.refresh, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token.value}` }
      })

      if (response.ok) {
        const data = await response.json()
        token.value = data.token
        setStoredToken(data.token)
      } else {
        await logout()
      }
    } catch {
      await logout()
    }
  }

  const fetchUser = async () => {
    if (!token.value) return

    loading.value = true

    try {
      const response = await fetch(apiEndpoints.me, {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })

      if (response.ok) {
        const userData = await response.json()
        user.value = userData
        setStoredUser(userData)
      } else {
        await logout()
      }
    } catch (err) {
      error.value = err as Error
      await logout()
    } finally {
      loading.value = false
    }
  }

  // Auto-initialize
  initialize()

  return {
    user: readonly(user) as Ref<User | null>,
    token: readonly(token) as Ref<string | null>,
    isAuthenticated: readonly(isAuthenticated) as Ref<boolean>,
    loading: readonly(loading) as Ref<boolean>,
    error: readonly(error) as Ref<Error | null>,
    login,
    register,
    logout,
    refreshToken,
    fetchUser
  }
}
