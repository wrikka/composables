import { ref, onMounted, onUnmounted } from 'vue';

export interface UseFileDropOptions {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onDrop?: (files: File[]) => void;
  onError?: (error: Error) => void;
}

export function useFileDrop(options: UseFileDropOptions = {}) {
  const isDragging = ref(false);
  const files = ref<File[]>([]);
  const error = ref<Error | null>(null);

  const {
    accept = '*',
    multiple = true,
    maxSize = Infinity,
  } = options;

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = false;

    const droppedFiles = Array.from(e.dataTransfer?.files || []);

    const validFiles = droppedFiles.filter((file) => {
      if (accept !== '*' && !file.type.match(accept.replace('*', '.*'))) {
        return false;
      }
      if (file.size > maxSize) {
        return false;
      }
      return true;
    });

    if (validFiles.length === 0 && droppedFiles.length > 0) {
      error.value = new Error('No valid files dropped');
      return;
    }

    files.value = multiple ? validFiles : validFiles.slice(0, 1);

    if (options.onDrop) {
      options.onDrop(files.value);
    }
  }

  function clearFiles() {
    files.value = [];
    error.value = null;
  }

  onMounted(() => {
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
  });

  onUnmounted(() => {
    window.removeEventListener('dragover', handleDragOver);
    window.removeEventListener('dragleave', handleDragLeave);
    window.removeEventListener('drop', handleDrop);
  });

  return {
    isDragging,
    files,
    error,
    clearFiles,
  };
}
