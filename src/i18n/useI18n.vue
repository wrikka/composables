<template>
  <div>
    <h2>useI18n</h2>
    <select v-model="locale">
      <option value="en">English</option>
      <option value="fr">French</option>
    </select>
    <p>{{ t('greeting') }}</p>
    <p>{{ t('nav.home') }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from './useI18n'

const locale = ref('en')
const messages = ref({
  en: {
    greeting: 'Hello, World!',
    nav: {
      home: 'Home Page',
    },
  },
  fr: {
    greeting: 'Bonjour, le monde!',
    nav: {
      home: 'Page d\'accueil',
    },
  },
})

const { t } = useI18n({ locale, messages })
</script>
