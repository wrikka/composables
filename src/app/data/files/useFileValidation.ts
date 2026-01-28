import { ref, computed } from 'vue';

export interface FileValidationRule {
  name: string;
  validate: (file: File) => boolean;
  message: string;
}

export interface UseFileValidationOptions {
  maxSize?: number;
  accept?: string[];
  rules?: FileValidationRule[];
}

export function useFileValidation(options: UseFileValidationOptions = {}) {
  const files = ref<File[]>([]);
  const errors = ref<Record<string, string[]>>({});

  const {
    maxSize = Infinity,
    accept = [],
    rules = [],
  } = options;

  const isValid = computed(() => {
    return Object.values(errors.value).every(fileErrors => fileErrors.length === 0);
  });

  function validateFile(file: File): string[] {
    const fileErrors: string[] = [];

    if (file.size > maxSize) {
      fileErrors.push(`File size exceeds ${maxSize} bytes`);
    }

    if (accept.length > 0 && !accept.includes(file.type)) {
      fileErrors.push(`File type ${file.type} is not accepted`);
    }

    rules.forEach((rule) => {
      if (!rule.validate(file)) {
        fileErrors.push(rule.message);
      }
    });

    return fileErrors;
  }

  function addFile(file: File) {
    const fileErrors = validateFile(file);
    errors.value[file.name] = fileErrors;

    if (fileErrors.length === 0) {
      files.value.push(file);
    }

    return fileErrors.length === 0;
  }

  function removeFile(file: File) {
    files.value = files.value.filter(f => f !== file);
    delete errors.value[file.name];
  }

  function clearFiles() {
    files.value = [];
    errors.value = {};
  }

  function validateAll(): boolean {
    let allValid = true;

    files.value.forEach((file) => {
      const fileErrors = validateFile(file);
      errors.value[file.name] = fileErrors;

      if (fileErrors.length > 0) {
        allValid = false;
      }
    });

    return allValid;
  }

  return {
    files,
    errors,
    isValid,
    addFile,
    removeFile,
    clearFiles,
    validateAll,
  };
}
