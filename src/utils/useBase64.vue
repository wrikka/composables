<template>
  <div>
    <h2>useBase64</h2>
    <textarea v-model="text" rows="4" cols="50"></textarea>
    <p><strong>Encoded:</strong> <code>{{ encoded }}</code></p>
    <p><strong>Decoded:</strong> <code>{{ decoded }}</code></p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useBase64 } from "../useBase64";

const text = ref("Hello, wcomposables!");
const { encoded, decoded } = useBase64(text);
</script>
