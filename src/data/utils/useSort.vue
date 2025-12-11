<template>
  <div>
    <h2>useSort</h2>
    <button @click="setSort('name')">Sort by Name</button>
    <button @click="setSort('age')">Sort by Age</button>
    <p>Current sort: {{ sortState.key }} - {{ sortState.order }}</p>
    <h3>Sorted List:</h3>
    <ul>
      <li v-for="item in sortedList" :key="item.id">
        {{ item.name }} ({{ item.age }})
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSort } from '../useSort'

const data = ref([
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
  { id: 3, name: 'Charlie', age: 35 },
  { id: 4, name: 'David', age: 28 },
]);

const { sortedList, setSort, sortState } = useSort(data, { key: 'name', order: 'asc' });
</script>
