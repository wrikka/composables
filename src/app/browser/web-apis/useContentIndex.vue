<script setup lang="ts">
import { ref } from 'vue'
import { useContentIndex } from './useContentIndex'

const { add, delete: deleteFn, search, isAdding, isDeleting, isSearching, error } = useContentIndex()

const id = ref('')
const content = ref('')
const query = ref('')
const results = ref<any[]>([])

const handleAdd = async () => {
  await add(id.value, content.value)
}

const handleDelete = async () => {
  await deleteFn(id.value)
}

const handleSearch = async () => {
  results.value = await search(query.value)
}
</script>

<template>
  <div>
    <h2>Content Index</h2>
    <div>
      <input v-model="id" placeholder="ID" />
      <textarea v-model="content" placeholder="Content"></textarea>
      <button @click="handleAdd" :disabled="isAdding">
        {{ isAdding ? 'Adding...' : 'Add' }}
      </button>
      <button @click="handleDelete" :disabled="isDeleting">
        {{ isDeleting ? 'Deleting...' : 'Delete' }}
      </button>
      <input v-model="query" placeholder="Search query" />
      <button @click="handleSearch" :disabled="isSearching">
        {{ isSearching ? 'Searching...' : 'Search' }}
      </button>
      <div v-if="error">
        <p>Error: {{ error.message }}</p>
      </div>
      <div v-if="results.length > 0">
        <h3>Results:</h3>
        <ul>
          <li v-for="item in results" :key="item.id">{{ item.content }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
