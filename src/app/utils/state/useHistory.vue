<template>
  <div>
    <h2 class="text-xl font-bold">useHistory</h2>
    <p>Current Value: {{ value }}</p>
    <input v-model="value" type="text" class="border border-gray-300 rounded px-2.5 py-2" />
    <button @click="undo" :disabled="!canUndo" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Undo</button>
    <button @click="redo" :disabled="!canRedo" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Redo</button>
    <button @click="clear" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">Clear History</button>
    <h3 class="text-lg font-semibold mt-4">History:</h3>
    <pre class="bg-gray-50 p-2.5 max-h-[150px] overflow-y-auto m-0">{{ history }}</pre>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useHistory } from "./useHistory";

const value = ref("");
const { history, canUndo, canRedo, undo, redo, clear } = useHistory(value);
</script>
