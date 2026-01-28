<script setup lang="ts">
import { ref } from 'vue'
import { usePeriodicSync } from './usePeriodicSync'

const { register, unregister, isRegistering, isUnregistering, error } = usePeriodicSync()

const tag = ref('')
const minInterval = ref(3600000)

const handleRegister = async () => {
  await register(tag.value, { minInterval: minInterval.value })
}

const handleUnregister = async () => {
  await unregister(tag.value)
}
</script>

<template>
  <div>
    <h2>Periodic Sync</h2>
    <div>
      <input v-model="tag" placeholder="Sync tag" />
      <input v-model="minInterval" type="number" placeholder="Min interval (ms)" />
      <button @click="handleRegister" :disabled="isRegistering">
        {{ isRegistering ? 'Registering...' : 'Register' }}
      </button>
      <button @click="handleUnregister" :disabled="isUnregistering">
        {{ isUnregistering ? 'Unregistering...' : 'Unregister' }}
      </button>
      <div v-if="error">
        <p>Error: {{ error.message }}</p>
      </div>
    </div>
  </div>
</template>
