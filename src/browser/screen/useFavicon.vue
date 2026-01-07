<script setup lang="ts">
import { ref } from 'vue'
import { useFavicon } from './useFavicon'

const newFavicon = ref('https://vueuse.org/favicon.ico')
const { favicon, setFavicon } = useFavicon()

// Set initial favicon
setFavicon(newFavicon.value)
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">useFavicon</h2>
    <p>Current favicon: <code class="font-mono bg-gray-100 p-1 rounded break-all">{{ favicon }}</code></p>
    <div class="flex gap-2">
      <input v-model="newFavicon" type="text" class="input w-full" placeholder="Enter new favicon URL" />
      <button class="btn" @click="setFavicon(newFavicon)">Update</button>
    </div>
  </div>
</template>
