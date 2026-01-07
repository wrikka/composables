<template>
  <div>
    <h2>Parent Component</h2>
    <p>Parent value: {{ parentValue }}</p>
    <ChildComponent v-model="parentValue" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const parentValue = ref('Hello')
</script>
