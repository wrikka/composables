import { onBeforeUpdate, ref } from "vue";

export function useTemplateRefs() {
	const refs = ref<HTMLElement[]>([]);

	onBeforeUpdate(() => {
		refs.value = [];
	});

	const setRef = (el: any) => {
		if (el) {
			refs.value.push(el);
		}
	};

	return [refs, setRef];
}
