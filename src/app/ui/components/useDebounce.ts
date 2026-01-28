import { type Ref, ref, watch } from "vue";

export function useDebounce<T>(value: Ref<T>, delay: number): Ref<T> {
	const debouncedValue = ref(value.value) as Ref<T>;

	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	watch(value, (newValue) => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			debouncedValue.value = newValue;
		}, delay);
	});

	return debouncedValue;
}
