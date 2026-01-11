<template>
  <div>
    <h2>useIndexedDB</h2>
    <p>Status: {{ status }}</p>
    <div>
      <input v-model="newItem.key" placeholder="Key" />
      <input v-model="newItem.value" placeholder="Value" />
      <button @click="addItem">Add/Update Item</button>
    </div>
    <div>
      <input v-model="keyToGet" placeholder="Key to get" />
      <button @click="getItem(keyToGet)">Get Item</button>
      <p v-if="retrievedItem">Retrieved: {{ retrievedItem }}</p>
    </div>
    <div>
      <input v-model="keyToRemove" placeholder="Key to remove" />
      <button @click="removeItem(keyToRemove)">Remove Item</button>
    </div>
    <button @click="clearStore">Clear Store</button>
    <h3>All Items:</h3>
    <pre>{{ allItems }}</pre>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useIndexedDB } from "./useIndexedDB";

const {
	status,
	data: allItems,
	add,
	get,
	remove,
	clear,
} = useIndexedDB("my-db", "my-store");

const newItem = reactive({ key: "", value: "" });
const _keyToGet = ref("");
const keyToRemove = ref("");
const retrievedItem = ref(null);

const _addItem = async () => {
	if (newItem.key && newItem.value) {
		await add({ key: newItem.key, value: newItem.value });
		newItem.key = "";
		newItem.value = "";
	}
};

const _getItem = async (key) => {
	retrievedItem.value = await get(key);
};

const _removeItem = async (key) => {
	await remove(key);
	keyToRemove.value = "";
};

const _clearStore = async () => {
	await clear();
};
</script>

<style scoped>
input, button {
  margin: 5px;
}
pre {
  background-color: #f5f5f5;
  padding: 10px;
}
</style>
