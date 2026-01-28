import { ref } from 'vue';

export function useImagePreview() {
  const preview = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  function createPreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      isLoading.value = true;
      error.value = null;

      const reader = new FileReader();

      reader.onload = (e) => {
        preview.value = e.target?.result as string;
        isLoading.value = false;
        resolve(preview.value!);
      };

      reader.onerror = () => {
        const err = new Error('Failed to read file');
        error.value = err;
        isLoading.value = false;
        reject(err);
      };

      reader.readAsDataURL(file);
    });
  }

  function clearPreview() {
    preview.value = null;
    error.value = null;
  }

  return {
    preview,
    isLoading,
    error,
    createPreview,
    clearPreview,
  };
}
