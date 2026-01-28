import { computed, ref } from "vue";

export function useBase64(initialValue: string = "") {
	const text = ref(initialValue);
	const error = ref<Error | null>(null);

	const isBase64 = computed(() => {
		if (!text.value) return false;
		try {
			return btoa(atob(text.value)) === text.value;
		} catch {
			return false;
		}
	});

	const encoded = computed(() => {
		error.value = null;
		if (!text.value) return "";
		try {
			return btoa(text.value);
		} catch (err: any) {
			error.value = err;
			return "";
		}
	});

	const decoded = computed(() => {
		error.value = null;
		if (!text.value) return "";
		try {
			return atob(text.value);
		} catch (err: any) {
			error.value = err;
			return "";
		}
	});

	function encode(str: string = text.value) {
		text.value = btoa(str);
	}

	function decode(str: string = text.value) {
		text.value = atob(str);
	}

	return {
		text,
		encoded,
		decoded,
		isBase64,
		error,
		encode,
		decode,
	};
}
