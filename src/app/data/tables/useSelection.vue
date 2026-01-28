<script setup lang="ts">
import { ref } from "vue";
import { useSelection } from "./useSelection";

const data = ref([
	{ id: 1, name: "Alice" },
	{ id: 2, name: "Bob" },
	{ id: 3, name: "Charlie" },
	{ id: 4, name: "David" },
]);

const {
	selectedItems,
	allSelected,
	someSelected,
	isSelected,
	toggleSelection,
} = useSelection(data, "id");

const _indeterminate = someSelected;
</script>

<template>
  <div>
    <p>Selected: {{ selectedItems.map(i => i.name).join(', ') }}</p>
    <table class="w-full border-collapse">
      <thead>
        <tr>
          <th class="border border-gray-300 px-2 py-2 text-left">
            <input 
              type="checkbox" 
              :checked="allSelected" 
              :indeterminate="indeterminate"
              @change="allSelected = !allSelected"
            />
          </th>
          <th class="border border-gray-300 px-2 py-2 text-left">ID</th>
          <th class="border border-gray-300 px-2 py-2 text-left">Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.id" :class="{ 'bg-gray-200': isSelected(item) }">
          <td class="border border-gray-300 px-2 py-2">
            <input 
              type="checkbox" 
              :checked="isSelected(item)" 
              @change="toggleSelection(item)"
            />
          </td>
          <td class="border border-gray-300 px-2 py-2">{{ item.id }}</td>
          <td class="border border-gray-300 px-2 py-2">{{ item.name }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
