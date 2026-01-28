<template>
  <div>
    <h2 class="text-xl font-bold">useDragAndDrop</h2>
    <div ref="dropZoneRef" class="border-2 border-dashed border-gray-300 p-5 text-center transition-colors" :class="{ 'bg-gray-100': isOverDropZone }">
      <p>Drop files here</p>
    </div>
    <div v-if="files && files.length > 0">
      <h3 class="text-lg font-semibold">Dropped Files:</h3>
      <ul class="list-none p-0">
        <li v-for="(file, index) in files" :key="index">
          {{ file.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useDragAndDrop } from "../useDragAndDrop";

const dropZoneRef = ref(null);
const files = ref(null);

const onDrop = (droppedFiles) => {
  files.value = droppedFiles;
};

const { isOverDropZone } = useDragAndDrop(dropZoneRef, { onDrop });
</script>
