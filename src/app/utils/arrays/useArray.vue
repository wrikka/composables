<template>
  <div>
    <h2 class="text-xl font-bold">useArray</h2>
    <p>Array: <code>{{ array }}</code></p>
    <button @click="push(Math.round(Math.random() * 100))" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-2">Push Random</button>
    <button @click="pop()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-2">Pop</button>
    <button @click="shift()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-2">Shift</button>
    <button @click="unshift(Math.round(Math.random() * 100))" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-2">Unshift Random</button>
    <button @click="clear()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors mr-2">Clear</button>
    <button @click="reverse()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Reverse</button>
    <hr class="my-4" />
    <input v-model.number="itemToAdd" type="number" placeholder="Item to add" class="border border-gray-300 rounded px-2.5 py-2 mr-2" />
    <input v-model.number="indexToInsert" type="number" placeholder="Index" class="border border-gray-300 rounded px-2.5 py-2 mr-2" />
    <button @click="insertAt(indexToInsert, itemToAdd)" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-2">Insert At</button>
    <hr class="my-4" />
    <input v-model.number="indexToRemove" type="number" placeholder="Index to remove" class="border border-gray-300 rounded px-2.5 py-2 mr-2" />
    <button @click="removeAt(indexToRemove)" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Remove At</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useArray } from "../useArray";

const { array, push, pop, shift, unshift, clear, reverse, insertAt, removeAt } =
	useArray([1, 2, 3]);
const _itemToAdd = ref(99);
const _indexToInsert = ref(1);
const _indexToRemove = ref(1);
</script>
