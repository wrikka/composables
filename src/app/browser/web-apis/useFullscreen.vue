<script setup lang="ts">
import { computed, type Ref, ref } from "vue";
import { useFullscreen } from "./useFullscreen";

const elementToFullscreen: Ref<HTMLElement | null> = ref(null);
const { isSupported, toggle, isFullscreen } = useFullscreen();

const _isFullscreenValue = computed(() => isFullscreen());

async function _toggleElement() {
	const el = elementToFullscreen.value;
	if (!el) return;
	await toggle(el);
}
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">useFullscreen</h2>
    <p v-if="!isSupported">Fullscreen API not supported</p>
    <template v-else>
      <div ref="elementToFullscreen" class="p-4 bg-gray-100 border rounded space-y-2">
        <p>This is the element that will go fullscreen.</p>
        <p>Is fullscreen: <span class="font-mono font-bold" :class="isFullscreenValue ? 'text-green-500' : 'text-red-500'">{{ isFullscreenValue }}</span></p>
        <div class="flex gap-2">
          <button class="btn" @click="toggleElement">Toggle Fullscreen</button>
        </div>
      </div>
    </template>
  </div>
</template>
