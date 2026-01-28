<template>
  <div>
    <h2>Parent Component</h2>
    <p>Parent value: {{ parentValue }}</p>
    <ChildComponent v-model="parentValue" />
  </div>
</template>

<script setup>
import { ref } from "vue";

const _parentValue = ref("Hello");
</script>
