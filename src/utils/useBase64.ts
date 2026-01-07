import { computed, Ref } from 'vue'

export function useBase64(text: Ref<string>) {
  const encoded = computed(() => btoa(text.value))
  const decoded = computed(() => atob(encoded.value))

  return { encoded, decoded }
}
