<template>
  <div>
    <h2 class="text-xl font-bold">createGlobalState</h2>
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
    <div class="p-4 m-4 border border-gray-300 rounded">
      <h3 class="text-lg font-bold">Component A</h3>
      <p class="text-gray-600">Counter: {{ counter }}</p>
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="counter++">Increment</button>
    </div>
  `,
});

const _ComponentB = defineComponent({
	setup() {
		const counter = useGlobalCounter();
		return { counter };
	},
	template: `
    <div class="p-4 m-4 border border-gray-300 rounded">
      <h3 class="text-lg font-bold">Component B</h3>
      <p class="text-gray-600">Counter: {{ counter }}</p>
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="counter--">Decrement</button>
    </div>
  `,
});
</script>
