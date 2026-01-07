<template>
  <div>
    <h2>useIdle</h2>
    <p>Is user idle: {{ idle }}</p>
    <p>Last active time: {{ lastActive }}</p>
    <p>(Timeout is set to 3 seconds for this demo)</p>
  </div>
</template>

<script setup>
import { useIdle } from '../useIdle'

const { idle, lastActive } = useIdle(3000)
</script>
