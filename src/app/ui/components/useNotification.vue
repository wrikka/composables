<script setup lang="ts">
import { useNotification } from "./useNotification";

const { notifications, add, remove } = useNotification();
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Notifications</h2>
    <button
      @click="add({ message: 'Hello!', type: 'info' })"
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Add Notification
    </button>
    <div class="space-y-1">
      <div
        v-for="(notification, index) in notifications"
        :key="index"
        class="p-2 border rounded flex justify-between items-center"
      >
        <span>{{ notification.message }}</span>
        <button
          @click="remove(index)"
          class="text-red-500 hover:text-red-700"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>
