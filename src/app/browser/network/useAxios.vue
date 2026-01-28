<script setup lang="ts">
import { ref } from 'vue'
import { useAxios } from './useAxios'

const url = ref('https://jsonplaceholder.typicode.com/posts/1')
const {
  data,
  error,
  isLoading,
  isReady,
  isFinished,
  execute,
  get,
  post,
  put,
  del,
  patch,
} = useAxios()

async function handleGet() {
  await get(url.value)
}

async function handlePost() {
  await post('https://jsonplaceholder.typicode.com/posts', { title: 'Test', body: 'Test body' })
}

async function handlePut() {
  await put('https://jsonplaceholder.typicode.com/posts/1', { title: 'Updated' })
}

async function handleDelete() {
  await del('https://jsonplaceholder.typicode.com/posts/1')
}

async function handlePatch() {
  await patch('https://jsonplaceholder.typicode.com/posts/1', { title: 'Patched' })
}
</script>

<template>
  <div class="p-5 border border-gray-300 rounded-lg">
    <h2>Axios Demo</h2>
    <div class="my-3.75">
      <p>Loading: {{ isLoading }}</p>
      <p>Ready: {{ isReady }}</p>
      <p>Finished: {{ isFinished }}</p>
    </div>
    <div class="my-3.75">
      <input class="p-2 mr-2.5 w-[300px]" v-model="url" placeholder="Enter URL" />
      <button class="px-4 py-2 cursor-pointer" @click="handleGet">GET</button>
    </div>
    <div class="flex gap-2.5 my-3.75 flex-wrap">
      <button class="px-4 py-2 cursor-pointer" @click="handlePost">POST</button>
      <button class="px-4 py-2 cursor-pointer" @click="handlePut">PUT</button>
      <button class="px-4 py-2 cursor-pointer" @click="handleDelete">DELETE</button>
      <button class="px-4 py-2 cursor-pointer" @click="handlePatch">PATCH</button>
    </div>
    <div class="my-3.75" v-if="data">
      <h3>Response</h3>
      <pre class="bg-gray-100 p-2.5 rounded overflow-x-auto">{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
    <div class="my-3.75 text-red-500" v-if="error">
      <p>Error: {{ error.message }}</p>
    </div>
  </div>
</template>

