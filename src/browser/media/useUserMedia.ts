import { ref } from 'vue';

export function useUserMedia(options: MediaStreamConstraints = {}) {
  const stream = ref<MediaStream | null>(null);
  const error = ref<Error | null>(null);

  const start = async () => {
    try {
      stream.value = await navigator.mediaDevices.getUserMedia(options);
    } catch (e) {
      error.value = e as Error;
    }
  };

  const stop = () => {
    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop());
      stream.value = null;
    }
  };

  return { stream, error, start, stop };
}
