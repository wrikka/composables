import { ref, onUnmounted } from 'vue';

export interface UseDragAndDropOptions {
  onDragStart?: (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
  onDrop?: (e: DragEvent) => void;
  onDragOver?: (e: DragEvent) => void;
  onDragLeave?: (e: DragEvent) => void;
}

export function useDragAndDrop(options: UseDragAndDropOptions = {}) {
  const isDragging = ref(false);
  const dragOver = ref(false);

  function handleDragStart(e: DragEvent) {
    isDragging.value = true;
    if (options.onDragStart) {
      options.onDragStart(e);
    }
  }

  function handleDragEnd(e: DragEvent) {
    isDragging.value = false;
    if (options.onDragEnd) {
      options.onDragEnd(e);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    dragOver.value = true;
    if (options.onDragOver) {
      options.onDragOver(e);
    }
  }

  function handleDragLeave(e: DragEvent) {
    dragOver.value = false;
    if (options.onDragLeave) {
      options.onDragLeave(e);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragOver.value = false;
    isDragging.value = false;

    if (options.onDrop) {
      options.onDrop(e);
    }
  }

  function makeDraggable(element: HTMLElement) {
    element.setAttribute('draggable', 'true');
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);
  }

  function makeDropZone(element: HTMLElement) {
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('drop', handleDrop);
  }

  function cleanupDraggable(element: HTMLElement) {
    element.removeEventListener('dragstart', handleDragStart);
    element.removeEventListener('dragend', handleDragEnd);
  }

  function cleanupDropZone(element: HTMLElement) {
    element.removeEventListener('dragover', handleDragOver);
    element.removeEventListener('dragleave', handleDragLeave);
    element.removeEventListener('drop', handleDrop);
  }

  onUnmounted(() => {
    isDragging.value = false;
    dragOver.value = false;
  });

  return {
    isDragging,
    dragOver,
    makeDraggable,
    makeDropZone,
    cleanupDraggable,
    cleanupDropZone,
  };
}
