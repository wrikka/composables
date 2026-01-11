import { ref } from "vue";

export interface FilePickerOptions {
	accept?: string;
	multiple?: boolean;
	capture?: string;
	webkitdirectory?: boolean;
}

export interface FilePickerResult {
	files: File[];
	canceled: boolean;
}

export function useFilePicker(options: FilePickerOptions = {}) {
	const { accept = "*/*", multiple = false } = options;

	const isOpen = ref(false);
	const selectedFiles = ref<File[]>([]);
	const error = ref<string | null>(null);

	const pickFiles = (
		fileOptions: FilePickerOptions = {},
	): Promise<FilePickerResult> => {
		return new Promise((resolve) => {
			isOpen.value = true;
			error.value = null;

			const finalOptions = { ...options, ...fileOptions };
			const input = document.createElement("input");
			input.type = "file";
			input.accept = finalOptions.accept || accept;
			input.multiple = finalOptions.multiple ?? multiple;
			input.style.display = "none";

			if (finalOptions.capture) {
				input.setAttribute("capture", finalOptions.capture);
			}

			if (finalOptions.webkitdirectory) {
				input.setAttribute("webkitdirectory", "true");
			}

			const handleFiles = (files: FileList | null) => {
				if (files) {
					selectedFiles.value = Array.from(files);
					resolve({ files: selectedFiles.value, canceled: false });
				} else {
					selectedFiles.value = [];
					resolve({ files: [], canceled: true });
				}
				isOpen.value = false;
				document.body.removeChild(input);
			};

			input.addEventListener("change", (event) => {
				const target = event.target as HTMLInputElement;
				handleFiles(target.files);
			});

			input.addEventListener("cancel", () => {
				handleFiles(null);
			});

			input.addEventListener("error", () => {
				error.value = "File picker error occurred";
				isOpen.value = false;
				document.body.removeChild(input);
				resolve({ files: [], canceled: true });
			});

			document.body.appendChild(input);
			input.click();
		});
	};

	const pickSingleFile = async (): Promise<File | null> => {
		const result = await pickFiles({});
		return result.files[0] || null;
	};

	const pickMultipleFiles = async (): Promise<File[]> => {
		const result = await pickFiles({ multiple: true });
		return result.files;
	};

	const pickDirectory = async (): Promise<File[]> => {
		const result = await pickFiles({ webkitdirectory: true });
		return result.files;
	};

	const pickImage = async (): Promise<File | null> => {
		const result = await pickFiles({
			accept: "image/*",
			multiple: false,
		});
		return result.files[0] || null;
	};

	const pickImages = async (): Promise<File[]> => {
		const result = await pickFiles({
			accept: "image/*",
			multiple: true,
		});
		return result.files;
	};

	const pickVideo = async (): Promise<File | null> => {
		const result = await pickFiles({
			accept: "video/*",
			multiple: false,
		});
		return result.files[0] || null;
	};

	const pickAudio = async (): Promise<File | null> => {
		const result = await pickFiles({
			accept: "audio/*",
			multiple: false,
		});
		return result.files[0] || null;
	};

	const pickDocument = async (): Promise<File | null> => {
		const result = await pickFiles({
			accept: ".pdf,.doc,.docx,.txt",
			multiple: false,
		});
		return result.files[0] || null;
	};

	const pickDocuments = async (): Promise<File[]> => {
		const result = await pickFiles({
			accept: ".pdf,.doc,.docx,.txt,.rtf",
			multiple: true,
		});
		return result.files;
	};

	const clearFiles = () => {
		selectedFiles.value = [];
		error.value = null;
	};

	const getFileExtension = (file: File): string => {
		return file.name.split(".").pop()?.toLowerCase() || "";
	};

	const getFileSize = (file: File): string => {
		const bytes = file.size;
		const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

		if (bytes === 0) return "0 Bytes";

		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`;
	};

	const getFileType = (file: File): string => {
		if (file.type.startsWith("image/")) return "image";
		if (file.type.startsWith("video/")) return "video";
		if (file.type.startsWith("audio/")) return "audio";
		if (file.type.startsWith("text/")) return "text";
		if (file.type === "application/pdf") return "pdf";
		if (file.name.endsWith(".doc") || file.name.endsWith(".docx"))
			return "document";
		return "unknown";
	};

	const validateFiles = (
		files: File[],
		validator: (file: File) => boolean,
	): File[] => {
		return files.filter(validator);
	};

	const filterByType = (files: File[], type: string): File[] => {
		return files.filter((file) => getFileType(file) === type);
	};

	const filterByExtension = (files: File[], extensions: string[]): File[] => {
		return files.filter((file) => {
			const ext = getFileExtension(file);
			return extensions.some((e) => e.toLowerCase() === ext);
		});
	};

	const getTotalSize = (files: File[]): number => {
		return files.reduce((total, file) => total + file.size, 0);
	};

	return {
		isOpen,
		selectedFiles,
		error,
		pickFiles,
		pickSingleFile,
		pickMultipleFiles,
		pickDirectory,
		pickImage,
		pickImages,
		pickVideo,
		pickAudio,
		pickDocument,
		pickDocuments,
		clearFiles,
		getFileExtension,
		getFileSize,
		getFileType,
		validateFiles,
		filterByType,
		filterByExtension,
		getTotalSize,
	};
}
