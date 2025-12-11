import { computed, Ref } from 'vue'

export function useSlugify(text: Ref<string>) {
  const slug = computed(() => {
    return text.value
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
  })

  return { slug }
}
