<script setup lang="ts">
import { ref } from 'vue'
import { useExport } from './useExport'

const data = ref([
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' },
])

const { isExporting, exportToCSV } = useExport(data)

function handleExport() {
  exportToCSV({
    filename: 'users.csv',
    headers: ['ID', 'Full Name', 'Email Address'], // Custom headers
  })
}
</script>

<template>
  <div>
    <button @click="handleExport" :disabled="isExporting">
      {{ isExporting ? 'Exporting...' : 'Export to CSV' }}
    </button>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.email }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
