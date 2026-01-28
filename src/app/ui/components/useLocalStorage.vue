<script setup lang="ts">
import { useLocalStorage } from './useLocalStorage'

const {
  value,
  remove,
  isSupported
} = useLocalStorage('demo-key', 'default value', {
  storage: localStorage
})
</script>

<template>
  <div class="p-5 max-w-600px mx-auto">
    <div class="mb-5 p-2.5 bg-gray-50 rounded">
      <span :class="{ 'text-green-600': isSupported, 'text-red-600': !isSupported }">
        {{ isSupported ? '✓' : '✗' }}
      </span>
      Local Storage {{ isSupported ? 'Supported' : 'Not Supported' }}
    </div>

    <div class="mb-5">
      <label for="storage-input" class="block mb-2 font-semibold text-gray-700">Value:</label>
      <input
        id="storage-input"
        v-model="value"
        type="text"
        placeholder="Enter value to store"
        class="w-full px-2.5 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
      />
    </div>

    <div class="flex gap-2.5 mb-5">
      <button @click="value = ''" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">Clear</button>
      <button @click="remove" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Remove</button>
    </div>

    <div class="p-4 bg-gray-50 rounded-lg">
      <strong class="block mb-2">Current Value:</strong>
      <pre class="m-0 p-2.5 bg-white rounded overflow-x-auto text-xs">{{ value }}</pre>
    </div>

    <div class="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
      <p class="m-0 mb-2 text-sm leading-rel">The value is automatically persisted to localStorage.</p>
      <p class="m-0 text-sm leading-rel">Try refreshing the page - the value will be restored!</p>
    </div>
  </div>
</template>