<script setup lang="ts">
import { ref } from 'vue'
import { useDebounce } from './useDebounce'

const searchQuery = ref('')
const debouncedQuery = useDebounce(() => searchQuery.value, 300)

const handleSearch = () => {
  console.log('Searching for:', debouncedQuery.value)
}
</script>

<template>
  <div>
    <h2>Debounce</h2>
    <input v-model="searchQuery" placeholder="Search..." />
    <p>Debounced: {{ debouncedQuery }}</p>
    <button @click="handleSearch">Search</button>
  </div>
</template>
