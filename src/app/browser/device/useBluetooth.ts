import { onUnmounted, ref, computed } from 'vue';

export interface BluetoothDevice {
  id: string;
  name: string;
}

export interface UseBluetoothOptions {
  acceptAllDevices?: boolean;
  optionalServices?: string[];
  filters?: any[];
}

export function useBluetooth(options: UseBluetoothOptions = {}) {
  const isSupported = computed(() => 'bluetooth' in navigator);
  const device = ref<BluetoothDevice | null>(null);
  const server = ref<any>(null);
  const isConnected = ref(false);
  const isScanning = ref(false);
  const error = ref<Error | null>(null);

  let bluetoothDevice: any = null;

  async function requestDevice() {
    if (!isSupported.value) {
      error.value = new Error('Bluetooth is not supported');
      return null;
    }

    try {
      bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: options.acceptAllDevices ?? true,
        optionalServices: options.optionalServices,
        filters: options.filters,
      });

      device.value = {
        id: bluetoothDevice.id,
        name: bluetoothDevice.name || 'Unknown Device',
      };

      bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);

      return bluetoothDevice;
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
      const dev = await (navigator as any).bluetooth.getDevice(device.value.id);
      server.value = await dev.gatt?.connect() || null;
      isConnected.value = !!server.value;
      return isConnected.value;
    }
    catch (e) {
      error.value = e as Error;
      isConnected.value = false;
      return false;
    }
  }

  async function disconnect() {
    if (server.value) {
      server.value.disconnect();
      server.value = null;
    }
    isConnected.value = false;
  }

  function onDisconnected() {
    isConnected.value = false;
    server.value = null;
  }

  async function scan() {
    if (!isSupported.value) {
      error.value = new Error('Bluetooth is not supported');
      return [];
    }

    isScanning.value = true;
    const devices: BluetoothDevice[] = [];

    try {
      const scan = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
      });

      devices.push({
        id: scan.id,
        name: scan.name || 'Unknown Device',
      });
    }
    catch (e) {
      error.value = e as Error;
    }
    finally {
      isScanning.value = false;
    }

    return devices;
  }

  onUnmounted(() => {
    disconnect();
  });

  return {
    isSupported,
    device,
    server,
    isConnected,
    isScanning,
    error,
    requestDevice,
    connect,
    disconnect,
    scan,
  };
}
