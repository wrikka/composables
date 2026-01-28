<script setup lang="ts">
import { useDrawer } from './useDrawer'

const {
  isOpen,
  isClosing,
  open,
  close,
  toggle
} = useDrawer({
  position: 'right',
  size: '400px',
  closeOnEsc: true
})
</script>

<template>
  <div class="p-5">
    <button @click="open" class="btn-primary">Open Drawer</button>

    <div
      class="fixed inset-0 bg-black/50 opacity-0 invisible transition-all duration-300 z-[1000]"
      :class="{ 'opacity-100 visible': isOpen }"
      @click="close"
    />

    <div
      class="fixed top-0 right-0 bottom-0 w-400 bg-white transform translate-x-full transition-all duration-300 opacity-0 z-[1001] shadow-[-4px_0_12px_rgba(0,0,0,0.15)]"
      :class="{ 'translate-x-0 opacity-100': isOpen, 'opacity-0': isClosing }"
    >
      <div class="flex justify-between items-center p-5 border-b border-gray-200">
        <h2 class="m-0 text-xl">Drawer Title</h2>
        <button @click="close" class="bg-none border-0 text-2xl cursor-pointer p-0 leading-none text-gray-600 hover:text-gray-300">&times;</button>
      </div>

      <div class="p-5 flex-1 overflow-y-auto">
        <p class="m-0 mb-4 leading-rel">This is the drawer content.</p>
        <p class="m-0 leading-rel">You can put any content here.</p>
      </div>

      <div class="p-5 border-t border-gray-200 flex justify-end gap-2.5">
        <button @click="close" class="btn-secondary">Close</button>
      </div>
    </div>
  </div>
</template>

