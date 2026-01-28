<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useIntersectionObserver } from './useIntersectionObserver'

const elementRef = ref<HTMLElement>()
const { isIntersecting, observe } = useIntersectionObserver()

onMounted(() => {
  if (elementRef.value) {
    observe(elementRef.value)
  }
})
</script>

<template>
  <div>
    <h2>Intersection Observer</h2>
    <div ref="elementRef" style="height: 100vh; border: 1px solid #ccc;">
      <p>Is Intersecting: {{ isIntersecting }}</p>
    </div>
  </div>
</template>
