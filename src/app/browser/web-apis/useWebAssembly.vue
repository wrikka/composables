<script setup lang="ts">
import { ref } from 'vue'
import { useWebAssembly } from './useWebAssembly'

const { load, instance, isLoading, error } = useWebAssembly()

const url = ref('')

const handleLoad = async () => {
  await load(url.value)
}
</script>

<template>
  <div>
    <h2>WebAssembly</h2>
    <div>
      <input v-model="url" placeholder="WASM URL" />
      <button @click="handleLoad" :disabled="isLoading">
        {{ isLoading ? 'Loading...' : 'Load' }}
      </button>
      <p v-if="instance">WebAssembly loaded successfully</p>
      <div v-if="error">
        <p>Error: {{ error.message }}</p>
      </div>
    </div>
  </div>
</template>
