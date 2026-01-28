<script setup lang="ts">
import { ref } from 'vue'
import { useServiceWorker } from './useServiceWorker'

const { register, unregister, update, registration, isRegistering, isUpdating, error } = useServiceWorker()

const scriptURL = ref('/sw.js')

const handleRegister = async () => {
  await register(scriptURL.value)
}

const handleUnregister = async () => {
  await unregister()
}

const handleUpdate = async () => {
  await update()
}
</script>

<template>
  <div>
    <h2>Service Worker</h2>
    <div>
      <input v-model="scriptURL" placeholder="Service Worker URL" />
      <button @click="handleRegister" :disabled="isRegistering">
        {{ isRegistering ? 'Registering...' : 'Register' }}
      </button>
      <button @click="handleUnregister">Unregister</button>
      <button @click="handleUpdate" :disabled="isUpdating">
        {{ isUpdating ? 'Updating...' : 'Update' }}
      </button>
      <p v-if="registration">Service Worker registered</p>
      <div v-if="error">
        <p>Error: {{ error.message }}</p>
      </div>
    </div>
  </div>
</template>
