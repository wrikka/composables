import { computed, type Ref } from "vue";

export function useSum(numbers: Ref<number[]>) {
	const sum = computed(() => numbers.value.reduce((acc, val) => acc + val, 0));

	return { sum };
}
