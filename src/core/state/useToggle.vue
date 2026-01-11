<template>
  <div>
    <h2>useToggle</h2>
    <p>Value: {{ value }}</p>
    <button @click="toggle()">Toggle</button>
    <button @click="toggle(true)">Set to True</button>
    <button @click="toggle(false)">Set to False</button>
  </div>
</template>

<script setup>
import { useToggle } from "./useToggle";

const [_value, _toggle] = useToggle(false);
</script>
