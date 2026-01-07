<script setup lang="ts">
import { ref } from 'vue'
import { useSelection } from './useSelection'

const data = ref([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
  { id: 4, name: 'David' },
])

const { 
  selectedItems, 
  allSelected, 
  someSelected, 
  isSelected, 
  toggleSelection 
} = useSelection(data, 'id')

const indeterminate = someSelected

</script>

<template>
  <div>
    <p>Selected: {{ selectedItems.map(i => i.name).join(', ') }}</p>
    <table>
      <thead>
        <tr>
          <th>
            <input 
              type="checkbox" 
              :checked="allSelected" 
              :indeterminate="indeterminate"
              @change="allSelected = !allSelected"
            />
          </th>
          <th>ID</th>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.id" :class="{ selected: isSelected(item) }">
          <td>
            <input 
              type="checkbox" 
              :checked="isSelected(item)" 
              @change="toggleSelection(item)"
            />
          </td>
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.selected {
  background-color: #e0e0e0;
}
</style>
