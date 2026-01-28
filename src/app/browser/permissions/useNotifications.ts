import { ref, computed } from 'vue';

export function useNotifications() {
  const isSupported = computed(() => 'Notification' in window);
  const permission = ref<NotificationPermission>('default');
  const error = ref<Error | null>(null);

  async function requestPermission() {
    if (!isSupported.value) {
      error.value = new Error('Notifications are not supported');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      permission.value = result;
      return result;
    }
    catch (e) {
      error.value = e as Error;
      return 'denied';
    }
  }

  function show(title: string, options: NotificationOptions = {}) {
    if (!isSupported.value) {
      error.value = new Error('Notifications are not supported');
      return null;
    }

    if (permission.value !== 'granted') {
      error.value = new Error('Notification permission not granted');
      return null;
    }

    try {
      return new Notification(title, options);
    }
    catch (e) {
      error.value = e as Error;
      return null;
    }
  }

  return {
    isSupported,
    permission,
    error,
    requestPermission,
    show,
  };
}
