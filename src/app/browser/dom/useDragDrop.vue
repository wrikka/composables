<script setup lang="ts">
import { ref } from 'vue'
import { useDragDrop } from './useDragDrop'

const { isDragging, dragData, onDragStart, onDragEnd, onDrop } = useDragDrop()

const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
])

const handleDragStart = (item: any) => {
  onDragStart(item)
}

const handleDragEnd = () => {
  onDragEnd()
}

const handleDrop = (event: DragEvent) => {
  const data = JSON.parse(event.dataTransfer?.getData('text/plain') || '{}')
  onDrop(data)
}
</script>

<template>
  <div>
    <h2>Drag & Drop</h2>
    <div>
      <div
        v-for="item in items"
        :key="item.id"
        draggable="true"
        @dragstart="handleDragStart(item)"
        @dragend="handleDragEnd"
        style="padding: 8px; margin: 4px; border: 1px solid #ccc;"
      >
        {{ item.name }}
      </div>
    </div>
    <div
      @drop="handleDrop"
      @dragover.prevent
      style="padding: 16px; margin-top: 16px; border: 2px dashed #ccc; min-height: 100px;"
    >
      Drop Zone
      <p v-if="isDragging">Dragging: {{ dragData?.name }}</p>
    </div>
  </div>
</template>
