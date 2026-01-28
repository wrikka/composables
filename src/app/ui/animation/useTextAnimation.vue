<script setup lang="ts">
import { ref } from "vue";
import { useTextAnimation } from "./useTextAnimation";

const text = ref("This is a typewriter effect created with Vue Composables!");
const { animatedText, restart } = useTextAnimation(text, { interval: 50 });
</script>

<template>
  <div>
    <p class="font-mono text-xl min-h-[1.5em]">{{ animatedText }}<span class="animate-[blink_0.7s_infinite]">|</span></p>
    <button @click="restart" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Restart</button>
  </div>
</template>

