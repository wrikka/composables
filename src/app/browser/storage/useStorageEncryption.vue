<script setup lang="ts">
import { ref } from 'vue'
import { useStorageEncryption } from './useStorageEncryption'

const { encrypt, decrypt, isEncrypting, isDecrypting, error } = useStorageEncryption()

const input = ref('')
const key = ref('')
const output = ref('')

const handleEncrypt = async () => {
  try {
    output.value = await encrypt(input.value, key.value)
  } catch (err) {
    console.error(err)
  }
}

const handleDecrypt = async () => {
  try {
    output.value = await decrypt(input.value, key.value)
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <div>
    <h2>Storage Encryption</h2>
    <div>
      <input v-model="key" type="password" placeholder="Encryption key" />
      <textarea v-model="input" placeholder="Enter data to encrypt/decrypt"></textarea>
      <button @click="handleEncrypt" :disabled="isEncrypting">
        {{ isEncrypting ? 'Encrypting...' : 'Encrypt' }}
      </button>
      <button @click="handleDecrypt" :disabled="isDecrypting">
        {{ isDecrypting ? 'Decrypting...' : 'Decrypt' }}
      </button>
      <div v-if="error">
        <p>Error: {{ error.message }}</p>
      </div>
      <div v-if="output">
        <h3>Output:</h3>
        <pre>{{ output }}</pre>
      </div>
    </div>
  </div>
</template>
