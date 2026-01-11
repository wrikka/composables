<script setup lang="ts">
import { ref } from "vue";
import { useTextAnimation } from "./useTextAnimation";

const text = ref("This is a typewriter effect created with Vue Composables!");
const { animatedText, restart } = useTextAnimation(text, { interval: 50 });
</script>

<template>
  <div>
    <p class="text-container">{{ animatedText }}<span class="cursor">|</span></p>
    <button @click="restart">Restart</button>
  </div>
</template>

<style scoped>
.text-container {
  font-family: monospace;
  font-size: 1.2em;
  min-height: 1.5em;
}

.cursor {
  animation: blink 0.7s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
