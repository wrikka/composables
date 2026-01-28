import { ref } from 'vue';

export interface UseImageCompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export function useImageCompress(options: UseImageCompressOptions = {}) {
  const isCompressing = ref(false);
  const error = ref<Error | null>(null);
  const compressedFile = ref<File | null>(null);

  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'image/jpeg',
  } = options;

  async function compress(file: File): Promise<File | null> {
    isCompressing.value = true;
    error.value = null;

    try {
      const image = await loadImage(file);
      const { width, height } = calculateDimensions(image.width, image.height);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(image, 0, 0, width, height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            }
            else {
              reject(new Error('Failed to compress image'));
            }
          },
          format,
          quality,
        );
      });

      compressedFile.value = new File([blob], file.name, {
        type: format,
        lastModified: Date.now(),
      });

      return compressedFile.value;
    }
    catch (e) {
      error.value = e as Error;
      return null;
    }
    finally {
      isCompressing.value = false;
    }
  }

  function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load image'));
      image.src = URL.createObjectURL(file);
    });
  }

  function calculateDimensions(originalWidth: number, originalHeight: number) {
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      height = (maxWidth / width) * height;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (maxHeight / height) * width;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  function reset() {
    isCompressing.value = false;
    error.value = null;
    compressedFile.value = null;
  }

  return {
    isCompressing,
    error,
    compressedFile,
    compress,
    reset,
  };
}
