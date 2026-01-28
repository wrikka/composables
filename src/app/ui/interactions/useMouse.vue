<script setup lang="ts">
import { useMouse } from "./useMouse";

const { x, y } = useMouse();
</script>

<template>
  <div class="p-4 border rounded-md">
    <p>Mouse position:</p>
    <p>x: {{ x }}</p>
    <p>y: {{ y }}</p>
  </div>
</template>
