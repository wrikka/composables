<script setup lang="ts">
import { ref } from 'vue'
import { useThrottle } from './useThrottle'

const scrollPosition = ref(0)
const throttledPosition = useThrottle(() => scrollPosition.value, 100)

const handleScroll = (event: Event) => {
  scrollPosition.value = (event.target as HTMLElement).scrollTop
}
</script>

<template>
  <div>
    <h2>Throttle</h2>
    <div @scroll="handleScroll" style="height: 200px; overflow-y: auto;">
      <div style="height: 1000px;">
        <p>Scroll to test throttle</p>
        <p>Position: {{ throttledPosition }}</p>
      </div>
    </div>
  </div>
</template>
