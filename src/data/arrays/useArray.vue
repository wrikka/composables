<template>
  <div>
    <h2>useArray</h2>
    <p>Array: <code>{{ array }}</code></p>
    <button @click="push(Math.round(Math.random() * 100))">Push Random</button>
    <button @click="pop()">Pop</button>
    <button @click="shift()">Shift</button>
    <button @click="unshift(Math.round(Math.random() * 100))">Unshift Random</button>
    <button @click="clear()">Clear</button>
    <button @click="reverse()">Reverse</button>
    <hr />
    <input v-model.number="itemToAdd" type="number" placeholder="Item to add" />
    <input v-model.number="indexToInsert" type="number" placeholder="Index" />
    <button @click="insertAt(indexToInsert, itemToAdd)">Insert At</button>
    <hr />
    <input v-model.number="indexToRemove" type="number" placeholder="Index to remove" />
    <button @click="removeAt(indexToRemove)">Remove At</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useArray } from '../useArray'

const { array, push, pop, shift, unshift, clear, reverse, insertAt, removeAt } = useArray([1, 2, 3])
const itemToAdd = ref(99)
const indexToInsert = ref(1)
const indexToRemove = ref(1)
</script>

<style scoped>
button, input {
  margin: 4px;
}
</style>
