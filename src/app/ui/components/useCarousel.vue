<script setup lang="ts">
import { ref } from 'vue'
import { useCarousel } from './useCarousel'

const items = ref(['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4'])
const {
  currentIndex,
  currentItem,
  isFirst,
  isLast,
  canGoNext,
  canGoPrevious,
  isPlaying,
  isPaused,
  next,
  previous,
  goTo,
  first,
  last,
  play,
  pause,
  stop,
  reset
} = useCarousel(items, { loop: true })
</script>

<template>
  <div class="max-w-600px mx-auto p-5">
    <div class="flex overflow-hidden bg-gray-100 rounded-lg min-h-50">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="flex-0 w-full p-10 text-center text-2xl font-bold opacity-50 transition-opacity"
        :class="{ 'opacity-100': currentIndex === index }"
      >
        {{ item }}
      </div>
    </div>

    <div class="flex items-center justify-between mt-5">
      <button
        @click="previous"
        :disabled="isFirst"
        class="px-5 py-2.5 text-lg bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ←
      </button>

      <div class="flex gap-2">
        <button
          v-for="(item, index) in items"
          :key="index"
          @click="goTo(index)"
          class="w-2.5 h-2.5 rounded-full bg-gray-300 border-none cursor-pointer transition-colors"
          :class="{ 'bg-blue-600': currentIndex === index }"
        />
      </div>

      <button
        @click="next"
        :disabled="isLast"
        class="px-5 py-2.5 text-lg bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        →
      </button>
    </div>

    <div class="mt-5 p-4 bg-gray-50 rounded-lg text-center">
      <p>Active: {{ currentIndex + 1 }} / {{ items.length }}</p>
      <p>Item: {{ currentItem }}</p>
      <button @click="reset" class="mt-2.5 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">Reset</button>
    </div>
  </div>
</template>

