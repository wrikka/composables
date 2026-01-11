<script setup lang="ts">
import { useHash } from "./useHash";

const _hash = useHash();
</script>

<template>
  <div>
    <p>Current Hash: {{ hash }}</p>
    <a href="#foo">Set hash to #foo</a>
    <br />
    <a href="#bar">Set hash to #bar</a>
  </div>
</template>
