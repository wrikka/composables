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
    <h2>useFetch</h2>
    <button @click="execute">Fetch Post {{ id }}</button>
    <button @click="next">Next Post</button>

    <div v-if="isFetching" class="loading">Loading...</div>
    <div v-if="error" class="error">Error: {{ error.message }}</div>
    <div v-if="data" class="data">
      <h3>{{ data.title }}</h3>
      <p>{{ data.body }}</p>
    </div>
  </div>
</template>

<style scoped>
.loading, .error, .data {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
}
.error {
  border-color: red;
  color: red;
}
</style>
