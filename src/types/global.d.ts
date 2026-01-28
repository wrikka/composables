// Global type declarations for browser APIs
declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>
    deviceMemory?: number
  }

  interface BatteryManager extends EventTarget {
    charging: boolean
    chargingTime: number
    dischargingTime: number
    addEventListener(type: 'chargingchange', listener: (this: BatteryManager, ev: Event) => any, options?: boolean | AddEventListenerOptions): void
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void
    removeEventListener(type: 'chargingchange', listener: (this: BatteryManager, ev: Event) => any, options?: boolean | EventListenerOptions): void
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void
  }

  interface GPU {
    requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>
  }

  interface GPUAdapter {
    requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>
    features: GPUSupportedFeatures
    limits: GPUSupportedLimits
  }

  interface GPUDevice extends EventTarget {
    lost: Promise<GPUDeviceLostInfo>
    queue: GPUQueue
  }
}

export {}
