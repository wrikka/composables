<script setup lang="ts">
import { useEventListener } from "./useEventListener";

const target = document.createElement("div");
const stop = useEventListener(target, "click", () => console.log("Clicked"));
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Event Listener</h2>
    <p>Event listener attached to element</p>
  </div>
</template>
