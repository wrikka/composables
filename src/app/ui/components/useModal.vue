<script setup lang="ts">
import { useModal } from './useModal'

const {
  isOpen,
  open,
  close,
  toggle,
  size,
  position
} = useModal({
  defaultOpen: false,
  size: '600px',
  position: 'center',
  closeOnEsc: true,
  closeOnClickOutside: true
})
</script>

<template>
  <div class="p-5">
    <button @click="open" class="px-5 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">Open Modal</button>

    <div
      class="fixed inset-0 bg-black/50 opacity-0 invisible transition-all duration-300 z-[1000]"
      :class="{ 'opacity-100 visible': isOpen }"
      @click="close"
    />

    <div
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] opacity-0 invisible transition-all duration-300 z-[1001] max-h-[80vh] flex flex-col"
      :class="{ 'opacity-100 visible': isOpen }"
      :style="{ width: size }"
    >
      <div class="flex justify-between items-center p-5 border-b border-gray-200">
        <h2 class="m-0 text-xl">Modal Title</h2>
        <button @click="close" class="bg-none border-0 text-2xl cursor-pointer p-0 leading-none text-gray-600 hover:text-gray-300">&times;</button>
      </div>

      <div class="p-5 flex-1 overflow-y-auto">
        <p class="m-0 mb-4 leading-rel text-gray-600">This is the modal content.</p>
        <p class="m-0 mb-4 leading-rel text-gray-600">You can put any content here.</p>
        <p class="m-0 leading-rel text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>

      <div class="p-5 border-t border-gray-200 flex justify-end gap-2.5">
        <button @click="close" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">Close</button>
        <button @click="toggle" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Toggle</button>
      </div>
    </div>
  </div>
</template>

