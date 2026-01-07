import { ref } from 'vue'

export interface DragItem<T = any> {
  id: string
  data: T
  element?: HTMLElement
}

export interface UseDragAndDropOptions {
  onDragStart?: (item: DragItem) => void
  onDragEnd?: (item: DragItem) => void
  onDrop?: (item: DragItem, target: HTMLElement) => void
  onDragOver?: (item: DragItem, target: HTMLElement) => void
  onDragLeave?: (item: DragItem, target: HTMLElement) => void
}

export function useDragAndDrop<T = any>(options: UseDragAndDropOptions = {}) {
  const {
    onDragStart,
    onDragEnd,
    onDrop,
    onDragOver,
    onDragLeave
  } = options

  const isDragging = ref(false)
  const draggedItem = ref<DragItem<T> | null>(null)
  const dropTarget = ref<HTMLElement | null>(null)

  const makeDraggable = (element: HTMLElement, item: DragItem<T>) => {
    element.draggable = true
    item.element = element

    const handleDragStart = (e: DragEvent) => {
      isDragging.value = true
      draggedItem.value = item

      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', item.id)
      }

      element.classList.add('dragging')
      onDragStart?.(item)
    }

    const handleDragEnd = () => {
      isDragging.value = false
      draggedItem.value = null
      dropTarget.value = null

      element.classList.remove('dragging')
      onDragEnd?.(item)
    }

    element.addEventListener('dragstart', handleDragStart)
    element.addEventListener('dragend', handleDragEnd)

    return () => {
      element.removeEventListener('dragstart', handleDragStart)
      element.removeEventListener('dragend', handleDragEnd)
    }
  }

  const makeDroppable = (element: HTMLElement, options?: {
    onDrop?: (item: DragItem<T>) => void
    onDragOver?: (item: DragItem<T>) => void
    onDragLeave?: (item: DragItem<T>) => void
  }) => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.dataTransfer!.effectAllowed = 'move'
      
      if (draggedItem.value) {
        dropTarget.value = element
        element.classList.add('drag-over')
        onDragOver?.(draggedItem.value, element)
        options?.onDragOver?.(draggedItem.value as DragItem<T>)
      }
    }

    const handleDragLeave = (e: DragEvent) => {
      if (e.target === element) {
        element.classList.remove('drag-over')
        dropTarget.value = null
        onDragLeave?.(draggedItem.value!, element)
        options?.onDragLeave?.(draggedItem.value! as DragItem<T>)
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      
      if (draggedItem.value) {
        element.classList.remove('drag-over')
        onDrop?.(draggedItem.value, element)
        options?.onDrop?.(draggedItem.value as DragItem<T>)
      }
    }

    element.addEventListener('dragover', handleDragOver)
    element.addEventListener('dragleave', handleDragLeave)
    element.addEventListener('drop', handleDrop)

    return () => {
      element.removeEventListener('dragover', handleDragOver)
      element.removeEventListener('dragleave', handleDragLeave)
      element.removeEventListener('drop', handleDrop)
    }
  }

  const createDragItem = (id: string, data: T): DragItem<T> => {
    return { id, data }
  }

  return {
    isDragging,
    draggedItem,
    dropTarget,
    makeDraggable,
    makeDroppable,
    createDragItem
  }
}

// File drag and drop
export interface UseFileDropOptions {
  accept?: string[]
  multiple?: boolean
  onDrop?: (files: File[]) => void
  onDragOver?: () => void
  onDragLeave?: () => void
}

export function useFileDrop(options: UseFileDropOptions = {}) {
  const { accept = [], multiple = false, onDrop, onDragOver, onDragLeave } = options

  const isDragOver = ref(false)
  const droppedFiles = ref<File[]>([])

  const isValidFile = (file: File): boolean => {
    if (accept.length === 0) return true
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const mimeType = file.type.toLowerCase()
    
    return accept.some(acceptType => {
      if (acceptType.startsWith('.')) {
        return fileExtension === acceptType.toLowerCase()
      } else {
        return mimeType.includes(acceptType.toLowerCase())
      }
    })
  }

  const makeDroppable = (element: HTMLElement) => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      isDragOver.value = true
      element.classList.add('drag-over')
      onDragOver?.()
    }

    const handleDragLeave = (e: DragEvent) => {
      if (e.target === element) {
        isDragOver.value = false
        element.classList.remove('drag-over')
        onDragLeave?.()
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      isDragOver.value = false
      element.classList.remove('drag-over')

      const files = Array.from(e.dataTransfer?.files || [])
      
      const validFiles = files.filter(isValidFile)
      
      if (!multiple && validFiles.length > 1) {
        validFiles.length = 1 // Keep only first file if multiple is false
      }

      droppedFiles.value = validFiles
      onDrop?.(validFiles)
    }

    element.addEventListener('dragover', handleDragOver)
    element.addEventListener('dragleave', handleDragLeave)
    element.addEventListener('drop', handleDrop)

    return () => {
      element.removeEventListener('dragover', handleDragOver)
      element.removeEventListener('dragleave', handleDragLeave)
      element.removeEventListener('drop', handleDrop)
    }
  }

  const clearFiles = () => {
    droppedFiles.value = []
  }

  return {
    isDragOver,
    droppedFiles,
    makeDroppable,
    clearFiles
  }
}
