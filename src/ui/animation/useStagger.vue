<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStagger } from './useStagger'

const itemRefs = ref<HTMLElement[]>([])

const keyframes = [
  { opacity: 0, transform: 'translateY(20px)' },
  { opacity: 1, transform: 'translateY(0)' },
]

const { play } = useStagger(itemRefs, keyframes, {
  stagger: 100,
  duration: 500,
  easing: 'ease-out',
})

onMounted(() => {
  play()
})
</script>

<template>
  <div>
    <button @click="play">Animate In</button>
    <ul class="container">
      <li v-for="i in 5" :key="i" :ref="(el) => { if (el) itemRefs.push(el as HTMLElement) }">
        Item {{ i }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.container {
  list-style: none;
  padding: 0;
}

li {
  background-color: #42b883;
  color: white;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 4px;
  opacity: 0; /* Start hidden */
}
</style>
