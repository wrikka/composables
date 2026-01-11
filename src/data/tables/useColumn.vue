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

const _columns = initialColumns.map(useColumn);

const _data: Data[] = [
	{ id: 1, name: "Alice", email: "alice@example.com" },
	{ id: 2, name: "Bob", email: "bob@example.com" },
];
</script>

<template>
  <div>
    <div class="controls">
      <strong>Toggle Columns:</strong>
      <label v-for="col in columns" :key="String(col.column.value.key)">
        <input type="checkbox" :checked="col.isVisible.value" @change="col.toggleVisibility" />
        {{ col.column.value.label }}
      </label>
    </div>

    <table>
      <thead>
        <tr>
          <th 
            v-for="col in columns.filter(c => c.isVisible.value)" 
            :key="String(col.column.value.key)"
            :style="{ width: typeof col.width.value === 'number' ? `${col.width.value}px` : col.width.value }"
            :class="col.headerClasses.value"
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
          >
            {{ item[col.column.value.key as keyof Data] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.controls {
  margin-bottom: 1rem;
}
.controls label {
  margin-right: 1rem;
}
th.resizable {
  resize: horizontal;
  overflow: auto;
}
</style>
