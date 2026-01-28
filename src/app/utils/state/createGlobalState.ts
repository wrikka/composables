import { type Ref, ref } from "vue";

export function createGlobalState<T>(initialState: T): () => Ref<T> {
	const state = ref<T>(initialState) as Ref<T>;
	return () => state;
}
