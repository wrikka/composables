<script setup lang="ts">
import { ref } from 'vue'
import { useOnClickOutside } from './useOnClickOutside'

const el = ref<HTMLDivElement | null>(null)
const message = ref('Click outside me')

useOnClickOutside(el, () => {
  message.value = 'Clicked outside!'
})
</script>

<template>
  <div ref="el" class="p-4 border rounded-md bg-gray-200">
    <p>{{ message }}</p>
  </div>
</template>
