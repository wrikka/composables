import { ref } from "vue";

export interface ImageUploadOptions {
	accept?: string;
	maxSize?: number; // in bytes
	maxWidth?: number;
	maxHeight?: number;
	quality?: number; // 0-1
	preview?: boolean;
	multiple?: boolean;
}

export interface ImageUploadResult {
	file: File;
	preview: string;
	width: number;
	height: number;
	size: number;
}

export function useImageUpload(options: ImageUploadOptions = {}) {
	const {
		maxSize = 5 * 1024 * 1024, // 5MB
		maxWidth = 1920,
		maxHeight = 1080,
		quality = 0.8,
		preview = true,
		multiple = false,
	} = options;

	const isUploading = ref(false);
	const uploadedImages = ref<ImageUploadResult[]>([]);
	const error = ref<string | null>(null);
	const progress = ref(0);

	const validateImage = (file: File): boolean => {
		if (!file.type.startsWith("image/")) {
			error.value = "File must be an image";
			return false;
		}

		if (file.size > maxSize) {
			error.value = `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
			return false;
		}

		return true;
	};

	const createImagePreview = (file: File): Promise<string> => {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.readAsDataURL(file);
		});
	};

	const getImageDimensions = (
		file: File,
	): Promise<{ width: number; height: number }> => {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => resolve({ width: img.width, height: img.height });
			img.src = URL.createObjectURL(file);
		});
	};

	const resizeImage = (
		file: File,
		maxWidth: number,
		maxHeight: number,
		quality: number,
	): Promise<File> => {
		return new Promise((resolve) => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d")!;
			const img = new Image();

			img.onload = () => {
				let { width, height } = img;

				// Calculate new dimensions
				if (width > maxWidth || height > maxHeight) {
					const aspectRatio = width / height;

					if (width > height) {
						width = maxWidth;
						height = width / aspectRatio;
					} else {
						height = maxHeight;
						width = height * aspectRatio;
					}
				}

				canvas.width = width;
				canvas.height = height;

				// Draw and resize image
				ctx.drawImage(img, 0, 0, width, height);

				// Convert to blob
				canvas.toBlob(
					(blob) => {
						if (blob) {
							const resizedFile = new File([blob], file.name, {
								type: file.type,
								lastModified: Date.now(),
							});
							resolve(resizedFile);
						} else {
							resolve(file); // Return original if resize fails
						}
					},
					file.type,
					quality,
				);
			};

			img.src = URL.createObjectURL(file);
		});
	};

	const processImage = async (file: File): Promise<ImageUploadResult> => {
		// Validate image
		if (!validateImage(file)) {
			throw new Error(error.value || "Invalid image");
		}

		// Resize if needed
		const dimensions = await getImageDimensions(file);
		let processedFile = file;

		if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
			processedFile = await resizeImage(file, maxWidth, maxHeight, quality);
		}

		// Create preview
		const previewUrl = preview ? await createImagePreview(processedFile) : "";

		const finalDimensions = await getImageDimensions(processedFile);

		return {
			file: processedFile,
			preview: previewUrl,
			width: finalDimensions.width,
			height: finalDimensions.height,
			size: processedFile.size,
		};
	};

	const uploadImages = async (
		files: FileList | File[],
	): Promise<ImageUploadResult[]> => {
		isUploading.value = true;
		error.value = null;
		progress.value = 0;

		const fileArray = Array.from(files);
		const results: ImageUploadResult[] = [];

		try {
			for (let i = 0; i < fileArray.length; i++) {
				const file = fileArray[i];
				if (file) {
					const result = await processImage(file);
					results.push(result);
				}
				progress.value = ((i + 1) / fileArray.length) * 100;
			}

			uploadedImages.value = multiple
				? [...uploadedImages.value, ...results]
				: results;
			return results;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Upload failed";
			throw err;
		} finally {
			isUploading.value = false;
			progress.value = 0;
		}
	};

	const uploadSingleImage = async (file: File): Promise<ImageUploadResult> => {
		const results = await uploadImages([file]);
		return results[0]!;
	};

	const clearImages = () => {
		uploadedImages.value = [];
		error.value = null;
		progress.value = 0;
	};

	const removeImage = (index: number) => {
		uploadedImages.value.splice(index, 1);
	};

	const getImageDataUrl = (result: ImageUploadResult): string => {
		return result.preview;
	};

	const getImageBlob = (result: ImageUploadResult): Promise<Blob> => {
		return new Promise((resolve) => {
			fetch(result.preview)
				.then((res) => res.blob())
				.then(resolve);
		});
	};

	const getTotalSize = (): number => {
		return uploadedImages.value.reduce((total, img) => total + img.size, 0);
	};

	const getTotalSizeFormatted = (): string => {
		const bytes = getTotalSize();
		const sizes = ["Bytes", "KB", "MB", "GB"];

		if (bytes === 0) return "0 Bytes";

		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`;
	};

	return {
		isUploading,
		uploadedImages,
		error,
		progress,
		uploadImages,
		uploadSingleImage,
		clearImages,
		removeImage,
		getImageDataUrl,
		getImageBlob,
		getTotalSize,
		getTotalSizeFormatted,
	};
}
