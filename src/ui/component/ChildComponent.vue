<template>
  <div class="child">
    <h3>Child Component</h3>
    <p>Child's internal value (v-model):</p>
    <input v-model="model" />
  </div>
</template>

<script setup>
import { useVModel } from "../useVModel";

const props = defineProps({
	modelValue: String,
});

const _model = useVModel(props, "modelValue");
</script>

<style scoped>
.child {
  border: 1px solid #ccc;
  padding: 10px;
  margin-top: 10px;
}
input {
  width: 100%;
}
</style>
