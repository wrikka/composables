<script setup lang="ts">
import { ref } from 'vue'
import { useTimezone } from './useTimezone'

const {
  timezone,
  offset,
  dst,
  name,
  info,
  convertToTimezone,
  formatInTimezone,
} = useTimezone()

const testDate = ref(new Date())
const targetTimezone = ref('America/New_York')
const convertedDate = ref<Date | null>(null)
const formattedDate = ref('')
</script>

<template>
  <div class="p-5 border border-gray-300 rounded-lg">
    <h2>Timezone Demo</h2>
    <div class="my-3.75">
      <p>Timezone: {{ timezone }}</p>
      <p>Offset: {{ offset }} minutes</p>
      <p>DST: {{ dst }}</p>
      <p>Name: {{ name }}</p>
    </div>
    <div class="my-3.75">
      <h3>Complete Info</h3>
      <pre class="bg-gray-100 p-2.5 rounded overflow-x-auto">{{ JSON.stringify(info, null, 2) }}</pre>
    </div>
    <div class="my-3.75">
      <h3>Convert Timezone</h3>
      <input class="p-2 mr-2.5" v-model="targetTimezone" placeholder="Target timezone" />
      <button class="px-4 py-2 cursor-pointer" @click="convertedDate = convertToTimezone(testDate, targetTimezone)">
        Convert
      </button>
      <p v-if="convertedDate">Converted: {{ convertedDate }}</p>
    </div>
    <div class="my-3.75">
      <h3>Format in Timezone</h3>
      <button class="px-4 py-2 cursor-pointer" @click="formattedDate = formatInTimezone(testDate, { year: 'numeric', month: 'long', day: 'numeric' })">
        Format
      </button>
      <p v-if="formattedDate">Formatted: {{ formattedDate }}</p>
    </div>
  </div>
</template>

