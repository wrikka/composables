import { isRef, type Ref, ref, unref, watch } from "vue";

interface UseFetchOptions extends RequestInit {
	immediate?: boolean;
}

export function useFetch<T>(
	url: string | Ref<string>,
	options: UseFetchOptions = {},
) {
	const data = ref<T | null>(null);
	const error = ref<Error | null>(null);
	const isFetching = ref(false);
	const aborted = ref(false);

	const { immediate = true, ...fetchOptions } = options;

	let controller: AbortController | undefined;

	const abort = () => {
		if (controller) {
			controller.abort();
			aborted.value = true;
		}
	};

	const execute = async () => {
		abort(); // Abort previous request
		controller = new AbortController();
		aborted.value = false;
		isFetching.value = true;
		error.value = null;

		try {
			const res = await fetch(unref(url), {
				...fetchOptions,
				signal: controller.signal,
			});

			if (!res.ok) {
				throw new Error(res.statusText);
			}
			data.value = await res.json();
		} catch (e: any) {
			if (e.name === "AbortError") {
				// Fetch was aborted
			} else {
				error.value = e;
			}
		} finally {
			isFetching.value = false;
		}
	};

	if (isRef(url)) {
		watch(url, execute, { immediate });
	} else if (immediate) {
		execute();
	}

	return { data, error, isFetching, aborted, abort, execute };
}
