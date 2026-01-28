import { onUnmounted, ref, computed } from 'vue';

export interface SerialPort {
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
}

export interface UseSerialPortOptions {
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
}

export function useSerialPort(options: UseSerialPortOptions = {}) {
  const isSupported = computed(() => 'serial' in navigator);
  const port = ref<SerialPort | null>(null);
  const isOpen = ref(false);
  const error = ref<Error | null>(null);

  const defaultOptions: any = {
    baudRate: options.baudRate ?? 9600,
    dataBits: options.dataBits ?? 8,
    stopBits: options.stopBits ?? 1,
    parity: options.parity ?? 'none',
    bufferSize: options.bufferSize ?? 255,
  };

  async function requestPort() {
    if (!isSupported.value) {
      error.value = new Error('Serial Port is not supported');
      return null;
    }

    try {
      const serialPort = await (navigator as any).serial.requestPort();
      port.value = {
        readable: null,
        writable: null,
      };
      return serialPort;
    }
    catch (e) {
      error.value = e as Error;
      return null;
    }
  }

  async function open() {
    if (!port.value) {
      error.value = new Error('No port selected');
      return false;
    }

    try {
      const ports = await (navigator as any).serial.getPorts();
      const serialPort = ports[0];

      if (serialPort) {
        await serialPort.open(defaultOptions);
        port.value.readable = serialPort.readable;
        port.value.writable = serialPort.writable;
        isOpen.value = true;
        return true;
      }

      error.value = new Error('Port not found');
      return false;
    }
    catch (e) {
      error.value = e as Error;
      isOpen.value = false;
      return false;
    }
  }

  async function close() {
    const ports = await (navigator as any).serial.getPorts();
    const serialPort = ports[0];

    if (serialPort) {
      try {
        await serialPort.close();
      }
      catch (e) {
        error.value = e as Error;
      }
    }

    isOpen.value = false;
    port.value = null;
  }

  async function write(data: Uint8Array) {
    if (!port.value?.writable) {
      error.value = new Error('Port is not open for writing');
      return false;
    }

    try {
      const writer = port.value.writable.getWriter();
      await writer.write(data);
      writer.releaseLock();
      return true;
    }
    catch (e) {
      error.value = e as Error;
      return false;
    }
  }

  async function read(): Promise<Uint8Array | null> {
    if (!port.value?.readable) {
      error.value = new Error('Port is not open for reading');
      return null;
    }

    try {
      const reader = port.value.readable.getReader();
      const { value, done } = await reader.read();
      reader.releaseLock();

      if (done) {
        return null;
      }

      return value;
    }
    catch (e) {
      error.value = e as Error;
      return null;
    }
  }

  async function getPorts() {
    if (!isSupported.value) {
      error.value = new Error('Serial Port is not supported');
      return [];
    }

    try {
      return await (navigator as any).serial.getPorts();
    }
    catch (e) {
      error.value = e as Error;
      return [];
    }
  }

  onUnmounted(() => {
    close();
  });

  return {
    isSupported,
    port,
    isOpen,
    error,
    requestPort,
    open,
    close,
    write,
    read,
    getPorts,
  };
}
