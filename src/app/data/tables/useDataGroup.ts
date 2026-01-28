import { ref, computed } from "vue";

interface GroupConfig<T> {
	key: keyof T;
	expanded?: boolean;
}

interface GroupedData<T> {
	key: string;
	value: any;
	items: T[];
	children?: GroupedData<T>[];
}

interface UseDataGroupOptions<T> {
	data: T[];
}

export function useDataGroup<T = any>(options: UseDataGroupOptions<T>) {
	const { data } = options;

	const groupConfigs = ref<GroupConfig<T>[]>([]);
	const expandedGroups = ref<Set<string>>(new Set());

	const groupBy = (items: T[], configs: GroupConfig<T>[]): GroupedData<T>[] => {
		if (configs.length === 0) return items.map((item) => ({ key: "", value: null, items: [item] }));

		const [config, ...rest] = configs;
		const { key } = config;

		const groups = new Map<string, T[]>();

		items.forEach((item) => {
			const value = item[key];
			const groupKey = String(value);
			if (!groups.has(groupKey)) {
				groups.set(groupKey, []);
			}
			groups.get(groupKey)!.push(item);
		});

		return Array.from(groups.entries()).map(([groupKey, groupItems]) => ({
			key: groupKey,
			value: groupItems[0][key],
			items: groupItems,
			children: rest.length > 0 ? groupBy(groupItems, rest) : undefined,
		}));
	};

	const groupedData = computed(() => {
		if (groupConfigs.value.length === 0) return [];
		return groupBy(data, groupConfigs.value);
	});

	const addGroup = (key: keyof T, expanded = true) => {
		groupConfigs.value.push({ key, expanded });
		if (expanded) {
			expandedGroups.value.add(String(key));
		}
	};

	const removeGroup = (key: keyof T) => {
		groupConfigs.value = groupConfigs.value.filter((c) => c.key !== key);
		expandedGroups.value.delete(String(key));
	};

	const clearGroups = () => {
		groupConfigs.value = [];
		expandedGroups.value.clear();
	};

	const toggleGroup = (groupKey: string) => {
		if (expandedGroups.value.has(groupKey)) {
			expandedGroups.value.delete(groupKey);
		} else {
			expandedGroups.value.add(groupKey);
		}
	};

	const expandAll = () => {
		groupConfigs.value.forEach((config) => {
			expandedGroups.value.add(String(config.key));
		});
	};

	const collapseAll = () => {
		expandedGroups.value.clear();
	};

	const isExpanded = (groupKey: string) => expandedGroups.value.has(groupKey);

	return {
		groupConfigs,
		expandedGroups,
		groupedData,
		addGroup,
		removeGroup,
		clearGroups,
		toggleGroup,
		expandAll,
		collapseAll,
		isExpanded,
	};
}
