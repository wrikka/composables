<template>
  <div>
    <h2 class="text-xl font-bold">useForm</h2>
    <form @submit.prevent="onSubmit">
      <div class="mb-2.5">
        <label for="name" class="block mb-1">Name</label>
        <input id="name" v-bind="getFieldProps('name')" class="border border-gray-300 rounded px-2.5 py-2" />
        <p v-if="errors.name" class="text-red-600 text-sm">{{ errors.name }}</p>
      </div>
      <div class="mb-2.5">
        <label for="email" class="block mb-1">Email</label>
        <input id="email" v-bind="getFieldProps('email')" class="border border-gray-300 rounded px-2.5 py-2" />
        <p v-if="errors.email" class="text-red-600 text-sm">{{ errors.email }}</p>
      </div>
      <button type="submit" :disabled="isSubmitting || !isValid" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Submit</button>
      <button type="button" @click="reset" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">Reset</button>
    </form>
    <pre class="bg-gray-50 p-2.5 m-0">Values: {{ values }}</pre>
    <pre class="bg-gray-50 p-2.5 m-0">Errors: {{ errors }}</pre>
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
