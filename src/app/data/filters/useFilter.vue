<template>
  <div>
    <h2>useFilter</h2>
    <input v-model="searchTerm" type="text" placeholder="Search..." />
    <h3>Filtered List:</h3>
    <ul>
      <li v-for="item in filteredList" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useFilter } from "../useFilter";

const list = ref([
	{ id: 1, name: "Apple" },
	{ id: 2, name: "Banana" },
	{ id: 3, name: "Orange" },
	{ id: 4, name: "Pineapple" },
	{ id: 5, name: "Grape" },
]);

const { filteredList, searchTerm } = useFilter(list, "name");
</script>
