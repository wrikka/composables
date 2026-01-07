<script setup lang="ts">
import { ref } from 'vue'
import { useResizableColumns } from './useResizableColumns'

const tableContainer = ref<HTMLElement | null>(null)
useResizableColumns(tableContainer)

</script>

<template>
  <div class="table-wrapper">
    <table ref="tableContainer">
      <thead>
        <tr>
          <th>
            <span>ID</span>
            <div class="resize-handle"></div>
          </th>
          <th>
            <span>Name</span>
            <div class="resize-handle"></div>
          </th>
          <th>
            <span>Email</span>
            <div class="resize-handle"></div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Alice</td>
          <td>alice@example.com</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Bob</td>
          <td>bob@example.com</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrapper {
  overflow-x: auto;
}
table {
  border-collapse: collapse;
  width: 100%;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  position: relative;
  overflow: visible;
}
.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 5px;
  height: 100%;
  cursor: col-resize;
  background: #f0f0f0;
  border-right: 1px solid #ccc;
}
</style>
