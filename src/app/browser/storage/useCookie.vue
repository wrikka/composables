<script setup lang="ts">
import { ref } from 'vue'
import { useCookie } from './useCookie'

const { cookies, setCookie, removeCookie, clearCookies } = useCookie()

const cookieName = ref('')
const cookieValue = ref('')
const cookieExpires = ref(7)

const handleSetCookie = () => {
  setCookie(cookieName.value, cookieValue.value, { expires: cookieExpires.value })
}

const handleRemoveCookie = (name: string) => {
  removeCookie(name)
}
</script>

<template>
  <div>
    <h2>Cookie Management</h2>
    <div>
      <input v-model="cookieName" placeholder="Cookie name" />
      <input v-model="cookieValue" placeholder="Cookie value" />
      <input v-model="cookieExpires" type="number" placeholder="Expires (days)" />
      <button @click="handleSetCookie">Set Cookie</button>
      <button @click="clearCookies">Clear All</button>
    </div>
    <div>
      <h3>Cookies:</h3>
      <ul>
        <li v-for="(value, name) in cookies" :key="name">
          {{ name }}: {{ value }}
          <button @click="handleRemoveCookie(name)">Remove</button>
        </li>
      </ul>
    </div>
  </div>
</template>
