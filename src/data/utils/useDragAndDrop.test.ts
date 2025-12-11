import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useDragAndDrop, useFileDrop } from './useDragAndDrop'

describe('useDragAndDrop', () => {
  let dragElement: HTMLElement
  let dropElement: HTMLElement

  beforeEach(() => {
    vi.clearAllMocks()
    
    dragElement = document.createElement('div')
    dropElement = document.createElement('div')
    document.body.appendChild(dragElement)
    document.body.appendChild(dropElement)
  })

  afterEach(() => {
    document.body.removeChild(dragElement)
    document.body.removeChild(dropElement)
  })

  it('should initialize with default values', () => {
    const { isDragging, draggedItem, dropTarget } = useDragAndDrop()

    expect(isDragging.value).toBe(false)
    expect(draggedItem.value).toBe(null)
    expect(dropTarget.value).toBe(null)
  })

  it('should make element draggable', () => {
    const { makeDraggable, createDragItem, isDragging, draggedItem } = useDragAndDrop()

    const item = createDragItem('item1', { name: 'Test Item' })
    const cleanup = makeDraggable(dragElement, item)

    expect(dragElement.draggable).toBe(true)

    // Simulate drag start
    const dragStartEvent = new DragEvent('dragstart', {
      dataTransfer: new DataTransfer()
    })
    dragElement.dispatchEvent(dragStartEvent)

    expect(isDragging.value).toBe(true)
    expect(draggedItem.value).toEqual(item)
    expect(dragElement.classList.contains('dragging')).toBe(true)

    // Simulate drag end
    const dragEndEvent = new DragEvent('dragend')
    dragElement.dispatchEvent(dragEndEvent)

    expect(isDragging.value).toBe(false)
    expect(draggedItem.value).toBe(null)
    expect(dragElement.classList.contains('dragging')).toBe(false)

    cleanup()
  })

  it('should make element droppable', () => {
    const { makeDroppable, createDragItem, dropTarget } = useDragAndDrop()

    createDragItem('item1', { name: 'Test Item' })

    const cleanup = makeDroppable(dropElement)

    // Start dragging
    const dragStartEvent = new DragEvent('dragstart', {
      dataTransfer: new DataTransfer()
    })
    dragElement.dispatchEvent(dragStartEvent)

    // Simulate drag over
    const dragOverEvent = new DragEvent('dragover', {
      dataTransfer: new DataTransfer()
    })
    dropElement.dispatchEvent(dragOverEvent)

    expect(dropTarget.value).toBe(dropElement)
    expect(dropElement.classList.contains('drag-over')).toBe(true)

    // Simulate drop
    const dropEvent = new DragEvent('drop', {
      dataTransfer: new DataTransfer()
    })
    dropElement.dispatchEvent(dropEvent)

    expect(dropElement.classList.contains('drag-over')).toBe(false)

    cleanup()
  })

  it('should call callbacks', () => {
    const onDragStart = vi.fn()
    const onDragEnd = vi.fn()
    const onDrop = vi.fn()
    const onDragOver = vi.fn()

    const { makeDraggable, makeDroppable, createDragItem } = useDragAndDrop({
      onDragStart,
      onDragEnd,
      onDrop,
      onDragOver
    })

    const item = createDragItem('item1', { name: 'Test Item' })
    makeDraggable(dragElement, item)
    makeDroppable(dropElement)

    // Drag start
    const dragStartEvent = new DragEvent('dragstart', {
      dataTransfer: new DataTransfer()
    })
    dragElement.dispatchEvent(dragStartEvent)
    expect(onDragStart).toHaveBeenCalledWith(item)

    // Drag over
    const dragOverEvent = new DragEvent('dragover', {
      dataTransfer: new DataTransfer()
    })
    dropElement.dispatchEvent(dragOverEvent)
    expect(onDragOver).toHaveBeenCalledWith(item, dropElement)

    // Drop
    const dropEvent = new DragEvent('drop', {
      dataTransfer: new DataTransfer()
    })
    dropElement.dispatchEvent(dropEvent)
    expect(onDrop).toHaveBeenCalledWith(item, dropElement)

    // Drag end
    const dragEndEvent = new DragEvent('dragend')
    dragElement.dispatchEvent(dragEndEvent)
    expect(onDragEnd).toHaveBeenCalledWith(item)
  })

  it('should handle custom droppable options', () => {
    const customOnDrop = vi.fn()
    const customOnDragOver = vi.fn()

    const { makeDraggable, makeDroppable, createDragItem } = useDragAndDrop()

    const item = createDragItem('item1', { name: 'Test Item' })
    makeDraggable(dragElement, item)

    const cleanup = makeDroppable(dropElement, {
      onDrop: customOnDrop,
      onDragOver: customOnDragOver
    })

    // Start dragging and drop
    const dragStartEvent = new DragEvent('dragstart', {
      dataTransfer: new DataTransfer()
    })
    dragElement.dispatchEvent(dragStartEvent)

    const dragOverEvent = new DragEvent('dragover', {
      dataTransfer: new DataTransfer()
    })
    dropElement.dispatchEvent(dragOverEvent)
    expect(customOnDragOver).toHaveBeenCalledWith(item)

    const dropEvent = new DragEvent('drop', {
      dataTransfer: new DataTransfer()
    })
    dropElement.dispatchEvent(dropEvent)
    expect(customOnDrop).toHaveBeenCalledWith(item)

    cleanup()
  })
})

describe('useFileDrop', () => {
  let dropElement: HTMLElement

  beforeEach(() => {
    vi.clearAllMocks()
    dropElement = document.createElement('div')
    document.body.appendChild(dropElement)
  })

  afterEach(() => {
    document.body.removeChild(dropElement)
  })

  it('should initialize with default values', () => {
    const { isDragOver, droppedFiles } = useFileDrop()

    expect(isDragOver.value).toBe(false)
    expect(droppedFiles.value).toEqual([])
  })

  it('should handle file drop', () => {
    const onDrop = vi.fn()
    const { makeDroppable, droppedFiles } = useFileDrop({ onDrop })

    const cleanup = makeDroppable(dropElement)

    // Create mock files
    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' })
    const file2 = new File(['content2'], 'file2.jpg', { type: 'image/jpeg' })

    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file1)
    dataTransfer.items.add(file2)

    // Simulate drop
    const dropEvent = new DragEvent('drop', {
      dataTransfer: dataTransfer
    })
    dropElement.dispatchEvent(dropEvent)

    expect(droppedFiles.value).toHaveLength(2)
    expect(droppedFiles.value[0]).toBe(file1)
    expect(droppedFiles.value[1]).toBe(file2)
    expect(onDrop).toHaveBeenCalledWith([file1, file2])

    cleanup()
  })

  it('should filter files by accept types', () => {
    const { makeDroppable, droppedFiles } = useFileDrop({ 
      accept: ['.txt', 'image/jpeg'] 
    })

    const cleanup = makeDroppable(dropElement)

    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' })
    const file2 = new File(['content2'], 'file2.jpg', { type: 'image/jpeg' })
    const file3 = new File(['content3'], 'file3.pdf', { type: 'application/pdf' })

    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file1)
    dataTransfer.items.add(file2)
    dataTransfer.items.add(file3)

    const dropEvent = new DragEvent('drop', {
      dataTransfer: dataTransfer
    })
    dropElement.dispatchEvent(dropEvent)

    expect(droppedFiles.value).toHaveLength(2) // Only txt and jpg accepted
    expect(droppedFiles.value.map(f => f.name)).toEqual(['file1.txt', 'file2.jpg'])

    cleanup()
  })

  it('should handle single file mode', () => {
    const { makeDroppable, droppedFiles } = useFileDrop({ 
      multiple: false 
    })

    const cleanup = makeDroppable(dropElement)

    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' })
    const file2 = new File(['content2'], 'file2.jpg', { type: 'image/jpeg' })

    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file1)
    dataTransfer.items.add(file2)

    const dropEvent = new DragEvent('drop', {
      dataTransfer: dataTransfer
    })
    dropElement.dispatchEvent(dropEvent)

    expect(droppedFiles.value).toHaveLength(1) // Only first file kept
    expect(droppedFiles.value[0]).toBe(file1)

    cleanup()
  })

  it('should handle drag over and leave states', () => {
    const onDragOver = vi.fn()
    const onDragLeave = vi.fn()
    const { makeDroppable, isDragOver } = useFileDrop({ 
      onDragOver, 
      onDragLeave 
    })

    const cleanup = makeDroppable(dropElement)

    // Drag over
    const dragOverEvent = new DragEvent('dragover', {
      dataTransfer: new DataTransfer()
    })
    dropElement.dispatchEvent(dragOverEvent)

    expect(isDragOver.value).toBe(true)
    expect(dropElement.classList.contains('drag-over')).toBe(true)
    expect(onDragOver).toHaveBeenCalled()

    // Drag leave
    const dragLeaveEvent = new DragEvent('dragleave')
    dropElement.dispatchEvent(dragLeaveEvent)

    expect(isDragOver.value).toBe(false)
    expect(dropElement.classList.contains('drag-over')).toBe(false)
    expect(onDragLeave).toHaveBeenCalled()

    cleanup()
  })

  it('should clear files', () => {
    const { makeDroppable, droppedFiles, clearFiles } = useFileDrop()

    const cleanup = makeDroppable(dropElement)

    const file = new File(['content'], 'file.txt', { type: 'text/plain' })
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)

    const dropEvent = new DragEvent('drop', {
      dataTransfer: dataTransfer
    })
    dropElement.dispatchEvent(dropEvent)

    expect(droppedFiles.value).toHaveLength(1)

    clearFiles()
    expect(droppedFiles.value).toEqual([])

    cleanup()
  })
})
