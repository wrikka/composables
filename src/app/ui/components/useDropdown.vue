<script setup lang="ts">
import { ref } from 'vue'
import { useDropdown } from './useDropdown'

const triggerRef = ref<HTMLElement | null>(null)
const {
  isOpen,
  open,
  close,
  toggle,
  handleKeyDown
} = useDropdown({
  closeOnEsc: true,
  closeOnOutsideClick: true
})
</script>

<template>
  <div class="p-5">
    <button
      ref="triggerRef"
      @click="toggle"
      @keydown="handleKeyDown"
      class="px-5 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
    >
      Toggle Dropdown
      <span class="text-xs transition-transform" :class="{ 'rotate-180': isOpen }">▼</span>
    </button>

    <div
      class="absolute top-full left-0 min-w-[200px] bg-white rounded shadow-[0_4px_12px_rgba(0,0,0,0.15)] opacity-0 invisible transition-all duration-200 z-[1000] mt-2"
      :class="{ 'opacity-100 visible translate-y-0': isOpen, 'opacity-0 invisible -translate-y-2.5': !isOpen }"
    >
      <div class="p-3 cursor-pointer hover:bg-gray-50 transition-colors">Option 1</div>
      <div class="p-3 cursor-pointer hover:bg-gray-50 transition-colors">Option 2</div>
      <div class="p-3 cursor-pointer hover:bg-gray-50 transition-colors">Option 3</div>
      <div class="h-1 bg-gray-200 my-1" />
      <div class="p-3 cursor-pointer hover:bg-red-50 text-red-600 transition-colors">Delete</div>
    </div>
  </div>
</template>

