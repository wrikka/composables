import { type Ref, ref, watch } from "vue";

export function useFocus(target: Ref<HTMLInputElement | null>) {
	const isFocused = ref(false);

	const onFocus = () => {
		isFocused.value = true;
	};

	const onBlur = () => {
		isFocused.value = false;
	};

	watch(
		target,
		(el) => {
			if (el) {
				el.addEventListener("focus", onFocus);
				el.addEventListener("blur", onBlur);
			}
		},
		{ immediate: true, flush: "post" },
	);

	return { isFocused };
}
