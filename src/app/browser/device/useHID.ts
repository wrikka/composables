import { onUnmounted, ref, computed } from 'vue';

export interface HIDDevice {
  vendorId: number;
  productId: number;
  productName?: string;
  manufacturerName?: string;
}

export interface UseHIDOptions {
  filters?: any[];
}

export function useHID(options: UseHIDOptions = {}) {
  const isSupported = computed(() => 'hid' in navigator);
  const device = ref<HIDDevice | null>(null);
  const isConnected = ref(false);
  const error = ref<Error | null>(null);

  async function requestDevice() {
    if (!isSupported.value) {
      error.value = new Error('HID is not supported');
      return null;
    }

    try {
      const hidDevice = await (navigator as any).hid.requestDevice({
        filters: options.filters,
      });

      device.value = {
        vendorId: hidDevice.vendorId,
        productId: hidDevice.productId,
        productName: hidDevice.productName,
        manufacturerName: hidDevice.manufacturerName,
      };

      return hidDevice;
    }
    catch (e) {
      error.value = e as Error;
      return null;
    }
  }

  async function connect() {
    if (!device.value) {
      error.value = new Error('No device selected');
      return false;
    }

    try {
      const devices = await (navigator as any).hid.getDevices();
      const hidDevice = devices.find(
        (d: any) => d.vendorId === device.value!.vendorId && d.productId === device.value!.productId,
      );

      if (hidDevice) {
        await hidDevice.open();
        isConnected.value = true;
        return true;
      }

      error.value = new Error('Device not found');
      return false;
    }
    catch (e) {
      error.value = e as Error;
      isConnected.value = false;
      return false;
    }
  }

  async function disconnect() {
    const devices = await (navigator as any).hid.getDevices();
    const hidDevice = devices.find(
      (d: any) => d.vendorId === device.value?.vendorId && d.productId === device.value?.productId,
    );

    if (hidDevice) {
      try {
        await hidDevice.close();
      }
      catch (e) {
        error.value = e as Error;
      }
    }

    isConnected.value = false;
  }

  async function getDevices() {
    if (!isSupported.value) {
      error.value = new Error('HID is not supported');
      return [];
    }

    try {
      const devices = await (navigator as any).hid.getDevices();
      return devices.map((d: any) => ({
        vendorId: d.vendorId,
        productId: d.productId,
        productName: d.productName,
        manufacturerName: d.manufacturerName,
      }));
    }
    catch (e) {
      error.value = e as Error;
      return [];
    }
  }

  onUnmounted(() => {
    disconnect();
  });

  return {
    isSupported,
    device,
    isConnected,
    error,
    requestDevice,
    connect,
    disconnect,
    getDevices,
  };
}
