<script setup lang="ts">
import { type Column, useColumn } from "./useColumn";

interface Data {
	id: number;
	name: string;
	email: string;
}

const initialColumns: Column<Data>[] = [
	{ key: "id", label: "ID", width: 50 },
	{ key: "name", label: "Name", isResizable: true, width: 150 },
	{ key: "email", label: "Email", isVisible: false, width: 200 },
];

const columns = initialColumns.map(useColumn);

const data: Data[] = [
	{ id: 1, name: "Alice", email: "alice@example.com" },
	{ id: 2, name: "Bob", email: "bob@example.com" },
];
</script>

<template>
  <div>
    <div class="mb-4">
      <strong>Toggle Columns:</strong>
      <label v-for="col in columns" :key="String(col.column.value.key)" class="mr-4">
        <input type="checkbox" :checked="col.isVisible.value" @change="col.toggleVisibility" />
        {{ col.column.value.label }}
      </label>
    </div>

    <table class="w-full border-collapse">
      <thead>
        <tr>
          <th 
            v-for="col in columns.filter(c => c.isVisible.value)" 
            :key="String(col.column.value.key)"
            :style="{ width: typeof col.width.value === 'number' ? `${col.width.value}px` : col.width.value }"
            :class="col.headerClasses.value"
            class="border border-gray-300 px-4 py-2 text-left"
            :class="{ 'resize-x overflow-auto': col.column.value.isResizable }"
          >
            {{ col.column.value.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.id">
          <td 
            v-for="col in columns.filter(c => c.isVisible.value)" 
            :key="String(col.column.value.key)"
            class="border border-gray-300 px-4 py-2"
          >
            {{ item[col.column.value.key as keyof Data] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
