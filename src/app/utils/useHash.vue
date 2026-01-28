<template>
  <div>
    <h2>useHash</h2>
    <p v-if="!isSupported">Web Crypto API not supported</p>
    <template v-else>
      <textarea v-model="text" rows="4" cols="50"></textarea>
      <p><strong>SHA-256 Hash:</strong> <code>{{ hash }}</code></p>
    </template>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useHash } from "../useHash";

const text = ref("Hello, wcomposables!");
const { hash, isSupported } = useHash(text);
</script>
