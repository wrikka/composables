<script setup lang="ts">
import { useStepper } from './useStepper'

const steps = [
  { title: 'Account', description: 'Create your account' },
  { title: 'Profile', description: 'Setup your profile' },
  { title: 'Preferences', description: 'Choose your preferences' },
  { title: 'Review', description: 'Review your information' }
]

const {
  currentIndex,
  totalSteps,
  isFirst,
  isLast,
  progress,
  next,
  previous,
  goTo,
  reset,
  setTotalSteps
} = useStepper({ totalSteps: steps.length })

setTotalSteps(steps.length)
</script>

<template>
  <div class="max-w-800px mx-auto p-5">
    <div class="flex justify-between mb-8 relative">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="relative z-1 flex-1 text-center cursor-pointer"
        :class="{
          'text-blue-600': currentIndex === index,
          'text-green-600': currentIndex > index
        }"
        @click="goTo(index)"
      >
        <div class="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center mx-auto mb-2.5 font-semibold transition-all">
          {{ currentIndex > index ? '✓' : index + 1 }}
        </div>
        <div class="font-semibold mb-1">{{ step.title }}</div>
        <div class="text-xs text-gray-500">{{ step.description }}</div>
      </div>
      <div class="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0" />
    </div>

    <div class="flex justify-center gap-2.5 mb-5">
      <button @click="previous" :disabled="isFirst" class="px-5 py-2.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        Previous
      </button>

      <button @click="next" :disabled="isLast" class="px-5 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {{ isLast ? 'Finish' : 'Next' }}
      </button>

      <button @click="reset" class="px-5 py-2.5 bg-transparent text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition-colors">
        Reset
      </button>
    </div>

    <div class="text-center p-4 bg-gray-50 rounded-lg">
      <p class="m-0">Step: {{ currentIndex + 1 }} / {{ totalSteps }}</p>
      <p class="m-0">Progress: {{ progress }}%</p>
    </div>
  </div>
</template>

