<script setup lang="ts">
import { ref } from 'vue'
import { useBackgroundSync } from './useBackgroundSync'

const { register, sync, isRegistering, isSyncing, error } = useBackgroundSync()

const tag = ref('')

const handleRegister = async () => {
  await register(tag.value)
}

const handleSync = async () => {
  await sync(tag.value)
}
</script>

<template>
  <div>
    <h2>Background Sync</h2>
    <div>
      <input v-model="tag" placeholder="Sync tag" />
      <button @click="handleRegister" :disabled="isRegistering">
        {{ isRegistering ? 'Registering...' : 'Register' }}
      </button>
      <button @click="handleSync" :disabled="isSyncing">
        {{ isSyncing ? 'Syncing...' : 'Sync' }}
      </button>
      <div v-if="error">
        <p>Error: {{ error.message }}</p>
      </div>
    </div>
  </div>
</template>
