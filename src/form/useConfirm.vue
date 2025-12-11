<template>
  <div>
    <h2>useConfirm</h2>
    <p>Status: {{ status }}</p>
    <button @click="confirm">Show Confirmation</button>
    <p v-if="status === 'confirmed'">You confirmed the action!</p>
    <p v-if="status === 'canceled'">You canceled the action.</p>
  </div>
</template>

<script setup>
import { useConfirm } from './useConfirm'

const { confirm, status } = useConfirm('Are you sure you want to proceed?')
</script>
