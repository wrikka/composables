<template>
  <div>
    <h2>useCookie</h2>
    <p>Cookie value: {{ cookieValue }}</p>
    <input v-model="cookieValue" type="text" />
    <p>(Value is stored in a cookie named 'my-cookie')</p>
  </div>
</template>

<script setup>
import { useCookie } from "./useCookie";

const _cookieValue = useCookie("my-cookie", { defaultValue: "Hello, Cookie!" });
</script>
