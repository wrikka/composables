import { ref, onMounted, onUnmounted } from 'vue'

export function useDeviceMotion() {
  const acceleration = ref({ x: 0, y: 0, z: 0 })
  const accelerationIncludingGravity = ref({ x: 0, y: 0, z: 0 })
  const rotationRate = ref({ alpha: 0, beta: 0, gamma: 0 })
  const interval = ref(0)

  const onDeviceMotion = (event: DeviceMotionEvent) => {
    if (event.acceleration) {
      acceleration.value = {
        x: event.acceleration.x ?? 0,
        y: event.acceleration.y ?? 0,
        z: event.acceleration.z ?? 0,
      }
    }
    if (event.accelerationIncludingGravity) {
      accelerationIncludingGravity.value = {
        x: event.accelerationIncludingGravity.x ?? 0,
        y: event.accelerationIncludingGravity.y ?? 0,
        z: event.accelerationIncludingGravity.z ?? 0,
      }
    }
    if (event.rotationRate) {
      rotationRate.value = {
        alpha: event.rotationRate.alpha ?? 0,
        beta: event.rotationRate.beta ?? 0,
        gamma: event.rotationRate.gamma ?? 0,
      }
    }
    interval.value = event.interval
  }

  onMounted(() => {
    window.addEventListener('devicemotion', onDeviceMotion)
  })

  onUnmounted(() => {
    window.removeEventListener('devicemotion', onDeviceMotion)
  })

  return {
    acceleration,
    accelerationIncludingGravity,
    rotationRate,
    interval,
  }
}
