<script setup lang="ts">
import { ref } from "vue";
import { useRafFn } from "./useRafFn";

const count = ref(0);

useRafFn(() => {
	count.value++;
});
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
  </div>
</template>
