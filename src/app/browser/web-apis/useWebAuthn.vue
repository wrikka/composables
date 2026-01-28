<script setup lang="ts">
import { ref } from 'vue'
import { useWebAuthn } from './useWebAuthn'

const { register, authenticate, isRegistering, isAuthenticating, error } = useWebAuthn()

const username = ref('')

const handleRegister = async () => {
  await register(username.value)
}

const handleAuthenticate = async () => {
  await authenticate(username.value)
}
</script>

<template>
  <div>
    <h2>WebAuthn</h2>
    <div>
      <input v-model="username" placeholder="Username" />
      <button @click="handleRegister" :disabled="isRegistering">
        {{ isRegistering ? 'Registering...' : 'Register' }}
      </button>
      <button @click="handleAuthenticate" :disabled="isAuthenticating">
        {{ isAuthenticating ? 'Authenticating...' : 'Authenticate' }}
      </button>
      <div v-if="error">
        <p>Error: {{ error.message }}</p>
      </div>
    </div>
  </div>
</template>
