<template>
  <div>
    <h2>useSearch</h2>
    <input v-model="searchTerm" type="text" placeholder="Search..." />
    <h3>Search Results:</h3>
    <ul>
      <li v-for="item in searchResults" :key="item.id">
        {{ item.name }} - {{ item.category }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSearch } from '../useSearch'

const data = ref([
  { id: 1, name: 'Laptop', category: 'Electronics' },
  { id: 2, name: 'Book', category: 'Stationery' },
  { id: 3, name: 'Smartphone', category: 'Electronics' },
  { id: 4, name: 'Desk Chair', category: 'Furniture' },
])

const { searchResults, searchTerm } = useSearch(data, ['name', 'category'])
</script>
