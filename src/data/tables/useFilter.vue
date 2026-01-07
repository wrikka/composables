<script setup lang="ts">
import { ref } from 'vue'
import { useFilter } from './useFilter'

const data = ref([
  { id: 1, name: 'Alice', category: 'A', active: true },
  { id: 2, name: 'Bob', category: 'B', active: false },
  { id: 3, name: 'Charlie', category: 'A', active: true },
  { id: 4, name: 'David', category: 'C', active: false },
  { id: 5, name: 'Eve', category: 'B', active: true },
])

const { filteredData, addFilter, clearFilters } = useFilter(data)

const categoryFilter = ref('')
const activeFilter = ref<boolean | null>(null)

const filterByCategory = (item: { category: string }) => {
  if (!categoryFilter.value) return true
  return item.category === categoryFilter.value
}

const filterByActive = (item: { active: boolean }) => {
  if (activeFilter.value === null) return true
  return item.active === activeFilter.value
}

function applyFilters() {
  clearFilters()
  addFilter(filterByCategory)
  addFilter(filterByActive)
}

// Apply initial filters
applyFilters()
</script>

<template>
  <div>
    <div>
      <label>
        Category:
        <select v-model="categoryFilter" @change="applyFilters">
          <option value="">All</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </label>
      <label>
        Status:
        <select v-model="activeFilter" @change="applyFilters">
          <option :value="null">All</option>
          <option :value="true">Active</option>
          <option :value="false">Inactive</option>
        </select>
      </label>
    </div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Category</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredData" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.category }}</td>
          <td>{{ item.active ? 'Active' : 'Inactive' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
