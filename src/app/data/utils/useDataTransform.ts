import { ref, computed } from "vue";

interface MappingRule<T, R> {
	from: keyof T;
	to: keyof R;
	transform?: (value: any) => any;
}

interface UseDataTransformOptions<T, R> {
	mapping?: MappingRule<T, R>[];
	defaultTransform?: (value: any) => any;
}

export function useDataTransform<T = any, R = any>(options: UseDataTransformOptions<T, R> = {}) {
	const { mapping = [], defaultTransform } = options;

	const transform = (data: T[]): R[] => {
		return data.map((item) => {
			const result = {} as R;

			if (mapping.length > 0) {
				mapping.forEach((rule) => {
					const value = item[rule.from];
					result[rule.to] = rule.transform ? rule.transform(value) : value;
				});
			} else {
				Object.keys(item).forEach((key) => {
					const value = item[key as keyof T];
					(result as any)[key] = defaultTransform ? defaultTransform(value) : value;
				});
			}

			return result;
		});
	};

	const transformItem = (item: T): R => {
		const result = {} as R;

		if (mapping.length > 0) {
			mapping.forEach((rule) => {
				const value = item[rule.from];
				result[rule.to] = rule.transform ? rule.transform(value) : value;
			});
		} else {
			Object.keys(item).forEach((key) => {
				const value = item[key as keyof T];
				(result as any)[key] = defaultTransform ? defaultTransform(value) : value;
			});
		}

		return result;
	};

	const addMapping = (rule: MappingRule<T, R>) => {
		mapping.push(rule);
	};

	const removeMapping = (from: keyof T) => {
		const index = mapping.findIndex((m) => m.from === from);
		if (index >= 0) {
			mapping.splice(index, 1);
		}
	};

	const clearMapping = () => {
		mapping.length = 0;
	};

	return {
		transform,
		transformItem,
		addMapping,
		removeMapping,
		clearMapping,
	};
}
