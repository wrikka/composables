import { ref, watch, onUnmounted, type Ref } from 'vue'

export interface UseTransitionOptions {
  duration?: number
  delay?: number
  easing?: string
  enterClass?: string
  leaveClass?: string
  enterActiveClass?: string
  leaveActiveClass?: string
  enterToClass?: string
  leaveToClass?: string
}

export interface UseTransitionReturn {
  visible: Ref<boolean>
  transitionClass: Ref<string>
  isTransitioning: Ref<boolean>
  enter: () => void
  leave: () => void
  toggle: () => void
}

export function useTransition(initialVisible = false, options: UseTransitionOptions = {}) {
  const {
    duration = 300,
    delay = 0,
    enterClass = 'enter',
    leaveClass = 'leave',
    enterActiveClass = 'enter-active',
    leaveActiveClass = 'leave-active',
    enterToClass = 'enter-to',
    leaveToClass = 'leave-to'
  } = options

  const visible = ref(initialVisible)
  const transitionClass = ref('')
  const isTransitioning = ref(false)
  const timeoutId = ref<NodeJS.Timeout | null>(null)

  const clearClass = () => {
    transitionClass.value = ''
  }

  const enter = () => {
    if (visible.value) return
    
    visible.value = true
    isTransitioning.value = true
    
    clearClass()
    
    requestAnimationFrame(() => {
      transitionClass.value = `${enterClass} ${enterActiveClass}`
      
      requestAnimationFrame(() => {
        transitionClass.value = `${enterActiveClass} ${enterToClass}`
      })
    })
    
    timeoutId.value = setTimeout(() => {
      clearClass()
      isTransitioning.value = false
    }, duration + delay)
  }

  const leave = () => {
    if (!visible.value) return
    
    visible.value = false
    isTransitioning.value = true
    
    clearClass()
    
    requestAnimationFrame(() => {
      transitionClass.value = `${leaveClass} ${leaveActiveClass}`
      
      requestAnimationFrame(() => {
        transitionClass.value = `${leaveActiveClass} ${leaveToClass}`
      })
    })
    
    timeoutId.value = setTimeout(() => {
      clearClass()
      isTransitioning.value = false
    }, duration + delay)
  }

  const toggle = () => {
    if (visible.value) {
      leave()
    } else {
      enter()
    }
  }

  watch(visible, (_newValue) => {
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
      timeoutId.value = null
    }
  })

  onUnmounted(() => {
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
    }
  })

  return {
    visible,
    transitionClass,
    isTransitioning,
    enter,
    leave,
    toggle
  }
}
