<script setup lang="ts">
import { useFormState } from './useFormState'

const { data, isDirty, isPristine, setData, setAllData, reset, clear } = useFormState<{
  name: string
  email: string
}>({
  initialValues: { name: '', email: '' },
})

const handleSubmit = () => {
  console.log('Form submitted:', data.value)
}

const handleReset = () => {
  reset()
}
</script>

<template>
  <div>
    <h2>Form State</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label>Name:</label>
        <input v-model="data.name" />
      </div>
      <div>
        <label>Email:</label>
        <input v-model="data.email" type="email" />
      </div>
      <div>
        <p>Dirty: {{ isDirty }}</p>
        <p>Pristine: {{ isPristine }}</p>
      </div>
      <button type="submit">Submit</button>
      <button type="button" @click="handleReset">Reset</button>
      <button type="button" @click="clear">Clear</button>
    </form>
  </div>
</template>
