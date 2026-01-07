<script setup lang="ts">
import { ref } from 'vue'
import { useRow } from './useRow'

const data = ref([
  { id: 1, name: 'Alice', details: 'Details for Alice' },
  { id: 2, name: 'Bob', details: 'Details for Bob' },
  { id: 3, name: 'Charlie', details: 'Details for Charlie' },
])

// This demonstrates how you might use useRow within a component that renders rows.
// In a real application, you'd likely instantiate useRow for each row inside a v-for loop.
const rows = data.value.map(item => useRow(item))

</script>

<template>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <template v-for="row in rows" :key="row.item.id">
        <tr 
          :class="row.rowClasses.value"
          @mouseover="row.onMouseover"
          @mouseleave="row.onMouseleave"
        >
          <td>{{ row.item.id }}</td>
          <td>{{ row.item.name }}</td>
          <td>
            <button @click="row.toggleExpand">
              {{ row.isExpanded.value ? 'Collapse' : 'Expand' }}
            </button>
          </td>
        </tr>
        <tr v-if="row.isExpanded.value">
          <td colspan="3">{{ row.item.details }}</td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<style scoped>
.hover {
  background-color: #f0f0f0;
}
.expanded {
  font-weight: bold;
}
td[colspan] {
  padding: 10px;
  background-color: #fafafa;
}
</style>
