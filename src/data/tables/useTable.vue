<template>
  <div>
    <h2>useTable</h2>
    <input v-model="searchTerm" type="text" placeholder="Search..." />
    <table>
      <thead>
        <tr>
          <th @click="setSort('id')">ID {{ sortIndicator('id') }}</th>
          <th @click="setSort('name')">Name {{ sortIndicator('name') }}</th>
          <th @click="setSort('age')">Age {{ sortIndicator('age') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginatedList" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.age }}</td>
        </tr>
      </tbody>
    </table>
    <div>
      <button @click="prev" :disabled="isFirstPage">Previous</button>
      <span>Page {{ currentPage }} of {{ pageCount }}</span>
      <button @click="next" :disabled="isLastPage">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTable } from '../useTable'

const data = ref([
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
  { id: 3, name: 'Charlie', age: 35 },
  { id: 4, name: 'David', age: 28 },
  { id: 5, name: 'Eve', age: 22 },
  { id: 6, name: 'Frank', age: 40 },
]);

const { 
  paginatedList, 
  currentPage, 
  pageCount, 
  isFirstPage, 
  isLastPage, 
  next, 
  prev, 
  searchTerm, 
  setSort,
  sortState
} = useTable(data, { 
  initialSort: { key: 'name', order: 'asc' },
  searchKeys: ['name'],
  pageSize: 3
});

const sortIndicator = (key) => {
  if (sortState.value.key === key) {
    return sortState.value.order === 'asc' ? '🔼' : '🔽';
  }
  return '';
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ccc;
  padding: 8px;
}
th {
  cursor: pointer;
  user-select: none;
}
</style>
