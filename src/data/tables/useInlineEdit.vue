<script setup lang="ts">
import { ref } from 'vue'
import { useInlineEdit } from './useInlineEdit'

const item = ref({ id: 1, name: 'Alice', email: 'alice@example.com' })

const onSaveName = async (newItem: typeof item.value) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  item.value = newItem
  console.log('Saved new name:', newItem.name)
}

const onSaveEmail = async (newItem: typeof item.value) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  item.value = newItem
  console.log('Saved new email:', newItem.email)
}

const nameEdit = useInlineEdit(item, 'name', onSaveName)
const emailEdit = useInlineEdit(item, 'email', onSaveEmail)

</script>

<template>
  <table>
    <tbody>
      <tr>
        <td><strong>Name</strong></td>
        <td @dblclick="nameEdit.startEditing">
          <span v-if="!nameEdit.isEditing.value">{{ item.name }}</span>
          <input 
            v-else 
            v-model="nameEdit.value.value" 
            @blur="nameEdit.save"
            @keyup.enter="nameEdit.save"
            @keyup.esc="nameEdit.cancelEditing"
          />
        </td>
      </tr>
      <tr>
        <td><strong>Email</strong></td>
        <td @dblclick="emailEdit.startEditing">
          <span v-if="!emailEdit.isEditing.value">{{ item.email }}</span>
          <input 
            v-else 
            v-model="emailEdit.value.value" 
            @blur="emailEdit.save"
            @keyup.enter="emailEdit.save"
            @keyup.esc="emailEdit.cancelEditing"
          />
        </td>
      </tr>
    </tbody>
  </table>
  <p class="instructions">Double-click a value to edit.</p>
</template>

<style scoped>
td {
  padding: 8px;
  border: 1px solid #eee;
}
input {
  padding: 4px;
  width: 100%;
}
.instructions {
  margin-top: 10px;
  font-size: 0.9em;
  color: #888;
}
</style>
