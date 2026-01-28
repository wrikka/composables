<script setup lang="ts">
import { ref } from "vue";
import { useInlineEdit } from "./useInlineEdit";

const item = ref({ id: 1, name: "Alice", email: "alice@example.com" });

const onSaveName = async (newItem: typeof item.value) => {
	// Simulate API call
	await new Promise((resolve) => setTimeout(resolve, 500));
	item.value = newItem;
	console.log("Saved new name:", newItem.name);
};

const onSaveEmail = async (newItem: typeof item.value) => {
	// Simulate API call
	await new Promise((resolve) => setTimeout(resolve, 500));
	item.value = newItem;
	console.log("Saved new email:", newItem.email);
};

const _nameEdit = useInlineEdit(item, "name", onSaveName);
const _emailEdit = useInlineEdit(item, "email", onSaveEmail);
</script>

<template>
  <table class="w-full border-collapse">
    <tbody>
      <tr>
        <td class="px-2 py-2 border border-gray-200"><strong>Name</strong></td>
        <td class="px-2 py-2 border border-gray-200" @dblclick="nameEdit.startEditing">
          <span v-if="!nameEdit.isEditing.value">{{ item.name }}</span>
          <input 
            v-else 
            v-model="nameEdit.value.value" 
            @blur="nameEdit.save"
            @keyup.enter="nameEdit.save"
            @keyup.esc="nameEdit.cancelEditing"
            class="px-1 py-1 w-full border border-gray-300 rounded"
          />
        </td>
      </tr>
      <tr>
        <td class="px-2 py-2 border border-gray-200"><strong>Email</strong></td>
        <td class="px-2 py-2 border border-gray-200" @dblclick="emailEdit.startEditing">
          <span v-if="!emailEdit.isEditing.value">{{ item.email }}</span>
          <input 
            v-else 
            v-model="emailEdit.value.value" 
            @blur="emailEdit.save"
            @keyup.enter="emailEdit.save"
            @keyup.esc="emailEdit.cancelEditing"
            class="px-1 py-1 w-full border border-gray-300 rounded"
          />
        </td>
      </tr>
    </tbody>
  </table>
  <p class="mt-2.5 text-sm text-gray-500">Double-click a value to edit.</p>
</template>
