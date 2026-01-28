import { onMounted, onUnmounted, ref, computed } from 'vue';

export interface NetworkStatus {
  isOnline: boolean;
  offlineAt: Date | null;
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
}

export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine);
  const offlineAt = ref<Date | null>(null);
  const downlink = ref(0);
  const effectiveType = ref('');
  const rtt = ref(0);
  const saveData = ref(false);

  const status = computed<NetworkStatus>(() => ({
    isOnline: isOnline.value,
    offlineAt: offlineAt.value,
    downlink: downlink.value,
    effectiveType: effectiveType.value,
    rtt: rtt.value,
    saveData: saveData.value,
  }));

  function updateNetworkInfo() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    if (connection) {
      downlink.value = connection.downlink || 0;
      effectiveType.value = connection.effectiveType || '';
      rtt.value = connection.rtt || 0;
      saveData.value = connection.saveData || false;

      connection.addEventListener('change', updateNetworkInfo);
    }
  }

  function handleOnline() {
    isOnline.value = true;
    offlineAt.value = null;
  }

  function handleOffline() {
    isOnline.value = false;
    offlineAt.value = new Date();
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    updateNetworkInfo();
  });

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.removeEventListener('change', updateNetworkInfo);
    }
  });

  return {
    isOnline,
    offlineAt,
    downlink,
    effectiveType,
    rtt,
    saveData,
    status,
  };
}
