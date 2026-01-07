<script setup lang="ts">
import { ref } from 'vue'
import { useGlobalSearch } from './useGlobalSearch'

const data = ref([
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User' },
  { id: 3, name: 'Charlie', email: 'charlie@work.com', role: 'User' },
  { id: 4, name: 'David', email: 'david@company.com', role: 'Manager' },
])

const { searchTerm, searchResults } = useGlobalSearch(data, ['name', 'email', 'role'])

</script>

<template>
  <div>
    <input 
      v-model="searchTerm"
      type="text" 
      placeholder="Search table..."
      class="search-input"
    />
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in searchResults" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.email }}</td>
          <td>{{ item.role }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.search-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
</style>
