import { ref } from 'vue'

export interface ConfirmOptions {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'error' | 'success'
  persistent?: boolean
}

export interface ConfirmDialog extends ConfirmOptions {
  id: string
  resolve: (value: boolean) => void
  reject: () => void
  timestamp: number
}

export function useConfirm(defaultOptions: ConfirmOptions = {}) {
  const dialogs = ref<ConfirmDialog[]>([])
  const isActive = ref(false)

  const generateId = () => `confirm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const confirm = (options: ConfirmOptions = {}): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const id = generateId()
      const dialog: ConfirmDialog = {
        ...defaultOptions,
        ...options,
        id,
        resolve,
        reject,
        timestamp: Date.now()
      }

      dialogs.value.push(dialog)
      isActive.value = true
    })
  }

  const confirmAction = (id: string) => {
    const dialog = dialogs.value.find(d => d.id === id)
    if (dialog) {
      dialog.resolve(true)
      removeDialog(id)
    }
  }

  const cancelAction = (id: string) => {
    const dialog = dialogs.value.find(d => d.id === id)
    if (dialog) {
      dialog.resolve(false)
      removeDialog(id)
    }
  }

  const rejectAction = (id: string) => {
    const dialog = dialogs.value.find(d => d.id === id)
    if (dialog) {
      dialog.reject()
      removeDialog(id)
    }
  }

  const removeDialog = (id: string) => {
    const index = dialogs.value.findIndex(d => d.id === id)
    if (index > -1) {
      dialogs.value.splice(index, 1)
    }
    if (dialogs.value.length === 0) {
      isActive.value = false
    }
  }

  const clearAll = () => {
    dialogs.value.forEach(dialog => {
      dialog.resolve(false)
    })
    dialogs.value = []
    isActive.value = false
  }

  return {
    dialogs,
    isActive,
    confirm,
    confirmAction,
    cancelAction,
    rejectAction,
    clearAll
  }
}

// Global confirm instance
let globalConfirm: ReturnType<typeof useConfirm> | null = null

export function useGlobalConfirm(defaultOptions?: ConfirmOptions) {
  if (!globalConfirm) {
    globalConfirm = useConfirm(defaultOptions)
  }
  return globalConfirm
}
