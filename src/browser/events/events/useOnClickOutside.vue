<template>
  <div>
    <h2>useOnClickOutside</h2>
    <div ref="target" class="target-area">
      <p>Click outside this box to trigger an alert.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useOnClickOutside } from '../useOnClickOutside'

const target = ref(null)

useOnClickOutside(target, () => {
  alert('Clicked outside!')
})
</script>

<style scoped>
.target-area {
  width: 300px;
  height: 150px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
