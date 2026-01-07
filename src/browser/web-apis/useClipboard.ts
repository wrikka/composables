import { ref } from 'vue';

export function useClipboard() {
  const text = ref('');
  const isSupported = 'clipboard' in navigator;

  const read = async () => {
    if (isSupported) {
      text.value = await navigator.clipboard.readText();
    }
  };

  const write = async (newText: string) => {
    if (isSupported) {
      await navigator.clipboard.writeText(newText);
      text.value = newText;
    }
  };

  return { text, read, write, isSupported };
}
