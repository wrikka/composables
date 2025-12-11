<template>
  <div>
    <h2>useTemplateRefs</h2>
    <ul>
      <li v-for="item in list" :key="item" :ref="setRef">
        {{ item }}
      </li>
    </ul>
    <button @click="logRefs">Log Refs to Console</button>
  </div>
</template>

<script setup>
import { useTemplateRefs } from '../useTemplateRefs'

const list = [1, 2, 3, 4, 5]
const [refs, setRef] = useTemplateRefs()

const logRefs = () => {
  console.log(refs.value)
  alert(`Found ${refs.value.length} refs. Check the console.`)
}
</script>
