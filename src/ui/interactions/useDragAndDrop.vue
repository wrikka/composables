<template>
  <div>
    <h2>useDragAndDrop</h2>
    <div ref="dropZoneRef" class="drop-zone" :class="{ 'is-over': isOverDropZone }">
      <p>Drop files here</p>
    </div>
    <div v-if="files && files.length > 0">
      <h3>Dropped Files:</h3>
      <ul>
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

<style scoped>
.drop-zone {
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  transition: background-color 0.2s;
}
.is-over {
  background-color: #f0f0f0;
}
</style>
