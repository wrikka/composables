<template>
  <div>
    <h2>createGlobalState</h2>
    <ComponentA />
    <ComponentB />
  </div>
</template>

<script setup>
import { defineComponent } from "vue";
import { createGlobalState } from "./createGlobalState";

// 1. Create the global state
const useGlobalCounter = createGlobalState(0);

// 2. Define components that use the global state
const _ComponentA = defineComponent({
	setup() {
		const counter = useGlobalCounter();
		return { counter };
	},
	template: `
    <div class="component">
      <h3>Component A</h3>
      <p>Counter: {{ counter }}</p>
      <button @click="counter++">Increment</button>
    </div>
  `,
});

const _ComponentB = defineComponent({
	setup() {
		const counter = useGlobalCounter();
		return { counter };
	},
	template: `
    <div class="component">
      <h3>Component B</h3>
      <p>Counter: {{ counter }}</p>
      <button @click="counter--">Decrement</button>
    </div>
  `,
});
</script>

<style scoped>
.component {
  border: 1px solid #ccc;
  padding: 10px;
  margin-top: 10px;
}
</style>
