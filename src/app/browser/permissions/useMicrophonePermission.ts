import { ref, computed } from 'vue';

export function useMicrophonePermission() {
  const isSupported = computed(() => 'permissions' in navigator);
  const permission = ref<PermissionState>('prompt');
  const error = ref<Error | null>(null);

  async function requestPermission() {
    if (!isSupported.value) {
      error.value = new Error('Permissions API is not supported');
      return 'denied';
    }

    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      permission.value = result.state;

      if (result.state === 'prompt') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        const newResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        permission.value = newResult.state;
      }

      return permission.value;
    }
    catch (e) {
      error.value = e as Error;
      return 'denied';
    }
  }

  return {
    isSupported,
    permission,
    error,
    requestPermission,
  };
}
