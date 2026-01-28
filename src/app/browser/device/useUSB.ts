import { onUnmounted, ref, computed } from 'vue';

export interface USBDevice {
  vendorId: number;
  productId: number;
  productName?: string;
  manufacturerName?: string;
}

export interface UseUSBOptions {
  filters?: any[];
}

export function useUSB(options: UseUSBOptions = {}) {
  const isSupported = computed(() => 'usb' in navigator);
  const device = ref<USBDevice | null>(null);
  const isConnected = ref(false);
  const error = ref<Error | null>(null);

  async function requestDevice() {
    if (!isSupported.value) {
      error.value = new Error('USB is not supported');
      return null;
    }

    try {
      const usbDevice = await (navigator as any).usb.requestDevice({
        filters: options.filters,
      });

      device.value = {
        vendorId: usbDevice.vendorId,
        productId: usbDevice.productId,
        productName: usbDevice.productName,
        manufacturerName: usbDevice.manufacturerName,
      };

      return usbDevice;
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
      const devices = await (navigator as any).usb.getDevices();
      const usbDevice = devices.find(
        (d: any) => d.vendorId === device.value!.vendorId && d.productId === device.value!.productId,
      );

      if (usbDevice) {
        await usbDevice.open();
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
    const devices = await (navigator as any).usb.getDevices();
    const usbDevice = devices.find(
      (d: any) => d.vendorId === device.value?.vendorId && d.productId === device.value?.productId,
    );

    if (usbDevice) {
      try {
        await usbDevice.close();
      }
      catch (e) {
        error.value = e as Error;
      }
    }

    isConnected.value = false;
  }

  async function getDevices() {
    if (!isSupported.value) {
      error.value = new Error('USB is not supported');
      return [];
    }

    try {
      const devices = await (navigator as any).usb.getDevices();
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
