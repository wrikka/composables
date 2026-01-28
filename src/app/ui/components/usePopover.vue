<script setup lang="ts">
import { ref } from 'vue'
import { usePopover } from './usePopover'

const triggerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const {
  isOpen,
  open,
  close,
  toggle,
  placement,
  offset
} = usePopover({
  placement: 'bottom',
  offset: 8,
  closeOnClickOutside: true,
  closeOnEsc: true
})
</script>

<template>
  <div class="p-5">
    <button
      ref="triggerRef"
      @click="toggle"
      class="px-5 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
    >
      Show Popover
    </button>

    <div
      ref="popoverRef"
      class="absolute bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] p-4 min-w-[200px] opacity-0 invisible transition-all duration-200 z-[1000] translate-y-[-2px]"
      :class="{ 'opacity-100 visible translate-y-0': isOpen }"
    >
      <div class="popover-content">
        <h3 class="m-0 mb-3 text-base font-semibold">Popover Title</h3>
        <p class="m-0 mb-2 leading-rel text-gray-600">This is the popover content.</p>
        <p class="m-0 leading-rel text-gray-600">You can put any content here.</p>
      </div>
    </div>
  </div>
</template>

