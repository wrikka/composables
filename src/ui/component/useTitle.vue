<script setup lang="ts">
import { useTitle } from './useTitle'

const title = useTitle('My Page Title')
</script>

<template>
  <div>
    <p>The document title is now: "{{ title }}"</p>
    <input v-model="title" type="text" class="p-2 border rounded-md mt-2" />
    <p class="text-sm text-gray-500">Check the browser tab title.</p>
  </div>
</template>
