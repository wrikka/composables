<script setup lang="ts">
import { useTransition } from './useTransition'

const { visible, transitionClass, toggle } = useTransition(false, {
  duration: 500,
  enterClass: 'opacity-0',
  enterActiveClass: 'transition-opacity duration-500',
  enterToClass: 'opacity-100',
  leaveClass: 'opacity-100',
  leaveActiveClass: 'transition-opacity duration-500',
  leaveToClass: 'opacity-0',
})
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <button class="btn" @click="toggle">Toggle Transition</button>
    <div v-if="visible" :class="transitionClass" class="w-20 h-20 bg-primary rounded">
      Box
    </div>
  </div>
</template>
