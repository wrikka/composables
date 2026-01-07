<template>
  <div>
    <h2>useMutationObserver</h2>
    <div ref="targetElement" class="target-area">
      <p>Observed Element</p>
      <p>Attribute: {{ attrValue }}</p>
    </div>
    <button @click="changeAttribute">Change Attribute</button>
    <button @click="addChild">Add Child</button>
    <h3>Mutation Records:</h3>
    <pre>{{ mutationRecords }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMutationObserver } from '../useMutationObserver'

const targetElement = ref(null)
const attrValue = ref('initial')
const mutationRecords = ref([])

const callback = (mutations) => {
  mutationRecords.value = mutations.map(m => ({
    type: m.type,
    attributeName: m.attributeName,
    addedNodes: m.addedNodes.length,
    removedNodes: m.removedNodes.length,
  }))
}

useMutationObserver(targetElement, callback, {
  attributes: true,
  childList: true,
})

const changeAttribute = () => {
  attrValue.value = `changed-${Math.random()}`
  if (targetElement.value) {
    targetElement.value.setAttribute('data-random', attrValue.value)
  }
}

const addChild = () => {
  if (targetElement.value) {
    const newChild = document.createElement('p')
    newChild.textContent = 'New Child'
    targetElement.value.appendChild(newChild)
  }
}
</script>

<style scoped>
.target-area {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}
pre {
  background-color: #f5f5f5;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
}
</style>
