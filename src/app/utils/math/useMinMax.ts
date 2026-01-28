import { computed, type Ref } from "vue";

export function useMinMax(numbers: Ref<number[]>) {
	const min = computed(() => {
		if (numbers.value.length === 0) return undefined;
		return Math.min(...numbers.value);
	});

	const max = computed(() => {
		if (numbers.value.length === 0) return undefined;
		return Math.max(...numbers.value);
	});

	return { min, max };
}
