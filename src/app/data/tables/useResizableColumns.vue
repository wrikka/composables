<script setup lang="ts">
import { ref } from "vue";
import { useResizableColumns } from "./useResizableColumns";

const tableContainer = ref<HTMLElement | null>(null);
useResizableColumns(tableContainer);
</script>

<template>
  <div class="overflow-x-auto">
    <table ref="tableContainer" class="w-full border-collapse">
      <thead>
        <tr>
          <th class="relative overflow-visible border border-gray-300 px-2 py-2 text-left">
            <span>ID</span>
            <div class="absolute top-0 right-0 w-[5px] h-full cursor-col-resize bg-gray-100 border-r border-gray-300"></div>
          </th>
          <th class="relative overflow-visible border border-gray-300 px-2 py-2 text-left">
            <span>Name</span>
            <div class="absolute top-0 right-0 w-[5px] h-full cursor-col-resize bg-gray-100 border-r border-gray-300"></div>
          </th>
          <th class="relative overflow-visible border border-gray-300 px-2 py-2 text-left">
            <span>Email</span>
            <div class="absolute top-0 right-0 w-[5px] h-full cursor-col-resize bg-gray-100 border-r border-gray-300"></div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border border-gray-300 px-2 py-2">1</td>
          <td class="border border-gray-300 px-2 py-2">Alice</td>
          <td class="border border-gray-300 px-2 py-2">alice@example.com</td>
        </tr>
        <tr>
          <td class="border border-gray-300 px-2 py-2">2</td>
          <td class="border border-gray-300 px-2 py-2">Bob</td>
          <td class="border border-gray-300 px-2 py-2">bob@example.com</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
