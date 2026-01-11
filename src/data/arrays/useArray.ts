import { computed, type Ref, ref } from "vue";

export interface UseArrayOptions<T> {
	initial?: T[];
}

export function useArray<T>(options: UseArrayOptions<T> = {}) {
	const { initial = [] } = options;

	const array = ref<T[]>([...initial]) as Ref<T[]>;

	const length = computed(() => array.value.length);
	const first = computed(() => array.value[0]);
	const last = computed(() => array.value[array.value.length - 1]);
	const isEmpty = computed(() => array.value.length === 0);

	const add = (item: T) => {
		array.value.push(item);
		return array.value;
	};

	const addAt = (item: T, index: number) => {
		array.value.splice(index, 0, item);
		return array.value;
	};

	const remove = (item: T) => {
		const index = array.value.indexOf(item);
		if (index > -1) {
			array.value.splice(index, 1);
		}
		return array.value;
	};

	const removeAt = (index: number) => {
		if (index >= 0 && index < array.value.length) {
			array.value.splice(index, 1);
		}
		return array.value;
	};

	const clear = () => {
		array.value = [];
		return array.value;
	};

	const reset = () => {
		array.value = [...initial];
		return array.value;
	};

	const find = (predicate: (item: T) => boolean) => {
		return array.value.find(predicate);
	};

	const filter = (predicate: (item: T) => boolean) => {
		return array.value.filter(predicate);
	};

	const map = <U>(fn: (item: T, index: number) => U) => {
		return array.value.map(fn);
	};

	const reduce = <U>(fn: (acc: U, item: T, index: number) => U, initial: U) => {
		return array.value.reduce(fn, initial);
	};

	const some = (predicate: (item: T) => boolean) => {
		return array.value.some(predicate);
	};

	const every = (predicate: (item: T) => boolean) => {
		return array.value.every(predicate);
	};

	const includes = (item: T) => {
		return array.value.includes(item);
	};

	const indexOf = (item: T) => {
		return array.value.indexOf(item);
	};

	const join = (separator?: string) => {
		return array.value.join(separator);
	};

	const reverse = () => {
		array.value = [...array.value].reverse();
		return array.value;
	};

	const sort = (compareFn?: (a: T, b: T) => number) => {
		array.value = [...array.value].sort(compareFn);
		return array.value;
	};

	const shuffle = () => {
		const shuffled = [...array.value];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = shuffled[i];
			if (shuffled[j] !== undefined) {
				shuffled[i] = shuffled[j];
				shuffled[j] = temp!;
			}
		}
		array.value = shuffled;
		return array.value;
	};

	const slice = (start?: number, end?: number) => {
		return array.value.slice(start, end);
	};

	const concat = (...arrays: T[][]) => {
		return array.value.concat(...arrays);
	};

	const unique = () => {
		array.value = [...new Set(array.value)];
		return array.value;
	};

	const clone = () => {
		return [...array.value];
	};

	return {
		array,
		length,
		first,
		last,
		isEmpty,
		add,
		addAt,
		remove,
		removeAt,
		clear,
		reset,
		find,
		filter,
		map,
		reduce,
		some,
		every,
		includes,
		indexOf,
		join,
		reverse,
		sort,
		shuffle,
		slice,
		concat,
		unique,
		clone,
	};
}
