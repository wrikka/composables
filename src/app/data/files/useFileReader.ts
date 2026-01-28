import { ref } from "vue";

type ReadAs = "text" | "dataURL" | "arrayBuffer";

export function useFileReader() {
	const result = ref<string | ArrayBuffer | null>(null);
	const isLoading = ref(false);
	const error = ref<any>(null);

	const read = (file: File, readAs: ReadAs = "text") => {
		isLoading.value = true;
		error.value = null;
		result.value = null;

		const reader = new FileReader();

		reader.onload = (e) => {
			result.value = e.target?.result || null;
			isLoading.value = false;
		};

		reader.onerror = (e) => {
			error.value = e.target?.error;
			isLoading.value = false;
		};

		switch (readAs) {
			case "text":
				reader.readAsText(file);
				break;
			case "dataURL":
				reader.readAsDataURL(file);
				break;
			case "arrayBuffer":
				reader.readAsArrayBuffer(file);
				break;
		}
	};

	return { result, isLoading, error, read };
}
