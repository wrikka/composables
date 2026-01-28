<script setup lang="ts">
import { useOrientation } from './useOrientation'

const { alpha, beta, gamma, absolute } = useOrientation()
</script>

<template>
  <div>
    <h2>Orientation</h2>
    <p>Alpha: {{ alpha }}</p>
    <p>Beta: {{ beta }}</p>
    <p>Gamma: {{ gamma }}</p>
    <p>Absolute: {{ absolute }}</p>
  </div>
</template>
