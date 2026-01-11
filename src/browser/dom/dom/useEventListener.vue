<template>
  <div>
    <h2>useEventListener</h2>
    <div ref="target" class="event-area">
      <p>Click me!</p>
      <p>Click count: {{ count }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useEventListener } from "../useEventListener";

const target = ref(null);
const count = ref(0);

useEventListener(target, "click", () => {
	count.value++;
});
</script>

<style scoped>
.event-area {
  width: 200px;
  height: 100px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
</style>
