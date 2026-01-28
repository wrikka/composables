<script setup lang="ts">
import { ref } from 'vue'
import { useFormValidation } from './useFormValidation'

const { errors, isValid, validate, validateAll, clearErrors, clearFieldError } = useFormValidation()

const formData = ref({
  email: '',
  password: '',
  username: '',
})

const rules = {
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { required: true, min: 8 },
  username: { required: true, min: 3, max: 20 },
}

const handleSubmit = () => {
  if (validateAll(formData.value, rules)) {
    console.log('Form submitted:', formData.value)
  }
}

const handleBlur = (field: string) => {
  validate(field, formData.value[field], rules[field])
}
</script>

<template>
  <div>
    <h2>Form Validation</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label>Email:</label>
        <input v-model="formData.email" @blur="handleBlur('email')" />
        <span v-if="errors.email" class="error">{{ errors.email }}</span>
      </div>
      <div>
        <label>Password:</label>
        <input v-model="formData.password" type="password" @blur="handleBlur('password')" />
        <span v-if="errors.password" class="error">{{ errors.password }}</span>
      </div>
      <div>
        <label>Username:</label>
        <input v-model="formData.username" @blur="handleBlur('username')" />
        <span v-if="errors.username" class="error">{{ errors.username }}</span>
      </div>
      <button type="submit" :disabled="!isValid">Submit</button>
    </form>
  </div>
</template>

<style scoped>
.error {
  color: red;
  margin-left: 8px;
}
</style>
