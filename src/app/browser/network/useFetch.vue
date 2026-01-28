<script setup lang="ts">
import { ref } from "vue";
import { useFetch } from "./useFetch";

interface Post {
	id: number;
	title: string;
	body: string;
}

const id = ref(1);
const url = ref(`https://jsonplaceholder.typicode.com/posts/${id.value}`);

const { data, error, isFetching, execute } = useFetch<Post>(url, {
	immediate: false,
});

const _next = () => {
	id.value++;
	url.value = `https://jsonplaceholder.typicode.com/posts/${id.value}`;
};
</script>

<template>
  <div>
    <h2 class="text-xl font-bold">useFetch</h2>
    <button @click="execute" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Fetch Post {{ id }}</button>
    <button @click="next" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Next Post</button>

    <div v-if="isFetching" class="mt-4 p-4 border border-gray-300">Loading...</div>
    <div v-if="error" class="mt-4 p-4 border border-red-500 text-red-600">Error: {{ error.message }}</div>
    <div v-if="data" class="mt-4 p-4 border border-gray-300">
      <h3 class="text-lg font-semibold">{{ data.title }}</h3>
      <p class="m-0">{{ data.body }}</p>
    </div>
  </div>
</template>

