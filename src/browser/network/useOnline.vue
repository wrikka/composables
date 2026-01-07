<script setup lang="ts">
import { useOnline } from './useOnline';

const { isOnline } = useOnline();
</script>

<template>
  <div>
    <p>Online status: {{ isOnline ? 'Online' : 'Offline' }}</p>
  </div>
</template>
