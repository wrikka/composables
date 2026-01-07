<template>
  <div>
    <h2>useKeyboard</h2>
    <p>Press 'ArrowUp', 'ArrowDown', 'ArrowLeft', or 'ArrowRight'</p>
    <p>Last key pressed: <strong>{{ lastKey }}</strong></p>
    <p>Key combination state:</p>
    <ul>
      <li>Ctrl: {{ ctrl }}</li>
      <li>Shift: {{ shift }}</li>
      <li>Alt: {{ alt }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useKeyboard } from '../useKeyboard'

const lastKey = ref('')
const { ctrl, shift, alt } = useKeyboard((event) => {
  lastKey.value = event.key
})
</script>
