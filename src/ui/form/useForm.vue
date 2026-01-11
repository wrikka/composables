<template>
  <div>
    <h2>useForm</h2>
    <form @submit.prevent="onSubmit">
      <div>
        <label for="name">Name</label>
        <input id="name" v-bind="getFieldProps('name')" />
        <p v-if="errors.name" class="error">{{ errors.name }}</p>
      </div>
      <div>
        <label for="email">Email</label>
        <input id="email" v-bind="getFieldProps('email')" />
        <p v-if="errors.email" class="error">{{ errors.email }}</p>
      </div>
      <button type="submit" :disabled="isSubmitting || !isValid">Submit</button>
      <button type="button" @click="reset">Reset</button>
    </form>
    <pre>Values: {{ values }}</pre>
    <pre>Errors: {{ errors }}</pre>
  </div>
</template>

<script setup>
import { useForm } from "./useForm";

const initialValues = {
	name: "",
	email: "",
};

const validator = (values) => {
	const errors = {};
	if (!values.name) {
		errors.name = "Name is required";
	}
	if (!values.email) {
		errors.email = "Email is required";
	} else if (!/.+@.+\..+/.test(values.email)) {
		errors.email = "Invalid email format";
	}
	return errors;
};

const { values, errors, isValid, isSubmitting, getFieldProps, submit, reset } =
	useForm(initialValues, validator);

const _onSubmit = submit(async (formValues) => {
	alert("Submitting!");
	await new Promise((resolve) => setTimeout(resolve, 1000));
	alert(`Submitted: ${JSON.stringify(formValues)}`);
});
</script>

<style scoped>
.error {
  color: red;
  font-size: 0.8em;
}
div {
  margin-bottom: 10px;
}
</style>
