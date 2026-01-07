<script setup lang="ts">
import { ref } from 'vue'
import { useEventListener } from './useEventListener'

const el = ref<HTMLDivElement | null>(null)
const message = ref('Click me')

useEventListener(el, 'click', () => {
  message.value = 'Clicked!'
})
</script>

<template>
  <div ref="el" class="p-4 border rounded-md cursor-pointer">
    {{ message }}
  </div>
</template>
