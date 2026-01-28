import { ref } from 'vue';

export interface UseFileUploadOptions {
  url: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  onProgress?: (progress: number) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
}

export function useFileUpload(options: UseFileUploadOptions) {
  const isUploading = ref(false);
  const progress = ref(0);
  const error = ref<Error | null>(null);
  const response = ref<any>(null);

  async function upload(file: File, additionalData?: Record<string, any>) {
    isUploading.value = true;
    progress.value = 0;
    error.value = null;
    response.value = null;

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          progress.value = (e.loaded / e.total) * 100;
          if (options.onProgress) {
            options.onProgress(progress.value);
          }
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            response.value = result;
            if (options.onSuccess) {
              options.onSuccess(result);
            }
          }
          catch {
            response.value = xhr.responseText;
            if (options.onSuccess) {
              options.onSuccess(xhr.responseText);
            }
          }
        }
        else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Upload failed');
      });

      xhr.open(options.method || 'POST', options.url);

      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      xhr.send(formData);
    }
    catch (e) {
      error.value = e as Error;
      if (options.onError) {
        options.onError(e as Error);
      }
    }
    finally {
      isUploading.value = false;
    }
  }

  function reset() {
    isUploading.value = false;
    progress.value = 0;
    error.value = null;
    response.value = null;
  }

  return {
    isUploading,
    progress,
    error,
    response,
    upload,
    reset,
  };
}
