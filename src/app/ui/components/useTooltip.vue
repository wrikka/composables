<script setup lang="ts">
import { useTooltip } from './useTooltip'

const {
  isOpen,
  isHovering,
  isFocused,
  handleMouseEnter,
  handleMouseLeave,
  handleFocusIn,
  handleFocusOut,
  toggle
} = useTooltip({
  placement: 'top',
  offset: 8,
  delay: 200,
  closeOnHover: false,
  closeOnClick: true,
  closeOnFocusOut: false
})
</script>

<template>
  <div class="p-5">
    <button
      ref="triggerRef"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @focusin="handleFocusIn"
      @focusout="handleFocusOut"
      @click="toggle"
      class="px-5 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
    >
      Hover or click me
    </button>

    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-gray-800 text-white px-3 py-2 rounded text-xs whitespace-nowrap opacity-0 invisible transition-all duration-200 z-[1000] -mt-2"
      :class="{ 'opacity-100 visible translate-y-0': isOpen, 'bg-gray-700': isHovering, 'bg-gray-600': isFocused }"
    >
      <div class="m-0">This is a tooltip!</div>
    </div>

    <div class="mt-10 p-4 bg-gray-50 rounded-lg text-center">
      <p class="m-0">Is Open: {{ isOpen }}</p>
      <p class="m-0">Is Hovering: {{ isHovering }}</p>
      <p class="m-0">Is Focused: {{ isFocused }}</p>
    </div>
  </div>
</template>

