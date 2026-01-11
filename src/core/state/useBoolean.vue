<template>
  <div>
    <h2>useBoolean</h2>
    <p>Value: {{ value }}</p>
    <button @click="toggle">Toggle</button>
    <button @click="setTrue">Set to True</button>
    <button @click="setFalse">Set to False</button>
  </div>
</template>

<script setup>
import { useBoolean } from "./useBoolean";

const { value, toggle, setTrue, setFalse } = useBoolean(false);
</script>
