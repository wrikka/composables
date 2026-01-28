<template>
  <div class="border border-gray-300 px-2.5 py-2.5 mt-2.5">
    <h3 class="text-lg font-semibold">Child Component</h3>
    <p>Child's internal value (v-model):</p>
    <input v-model="model" class="w-full border border-gray-300 rounded px-2.5 py-2" />
  </div>
</template>

<script setup>
import { useVModel } from "../useVModel";

const props = defineProps({
	modelValue: String,
});

const _model = useVModel(props, "modelValue");
</script>
