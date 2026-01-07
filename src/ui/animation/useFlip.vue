<script setup lang="ts">
import { ref } from 'vue'
import { useFlip } from './useFlip'

const items = ref([1, 2, 3, 4, 5])
const itemRefs = ref<HTMLElement[]>([])

const { play } = useFlip(itemRefs)

const shuffle = () => {
  play()
  items.value.sort(() => Math.random() - 0.5)
}
</script>

<template>
  <div>
    <button @click="shuffle">Shuffle</button>
    <div class="container">
      <div
        v-for="(item, index) in items"
        :key="item"
        :ref="(el) => { if (el) itemRefs[index] = el as HTMLElement }"
        class="item"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.item {
  width: 50px;
  height: 50px;
  background-color: #42b883;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}
</style>
