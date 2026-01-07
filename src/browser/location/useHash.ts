import { ref, onMounted, onUnmounted } from 'vue';

export function useHash() {
  const hash = ref(window.location.hash);

  const updateHash = () => {
    hash.value = window.location.hash;
  };

  onMounted(() => {
    window.addEventListener('hashchange', updateHash);
  });

  onUnmounted(() => {
    window.removeEventListener('hashchange', updateHash);
  });

  return hash;
}
