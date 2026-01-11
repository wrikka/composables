<template>
  <div>
    <h2>useHotkey</h2>
    <p>Press 'Ctrl+S' or 'Cmd+S' to see an alert.</p>
    <p>Press 'Shift+A' to focus the input.</p>
    <input ref="inputRef" type="text" placeholder="Press Shift+A to focus me" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useHotkey } from "../useHotkey";

const inputRef = ref(null);

useHotkey("ctrl+s, cmd+s", (event) => {
	event.preventDefault();
	alert("Saved!");
});

useHotkey("shift+a", () => {
	inputRef.value?.focus();
});
</script>
