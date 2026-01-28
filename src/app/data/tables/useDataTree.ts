import { ref, computed } from "vue";

interface TreeNode<T> {
	id: string;
	data: T;
	children?: TreeNode<T>[];
	isExpanded?: boolean;
	level: number;
	parentId?: string;
}

interface UseDataTreeOptions<T> {
	data: T[];
	idField?: keyof T;
	parentField?: keyof T;
	childrenField?: keyof T;
}

export function useDataTree<T = any>(options: UseDataTreeOptions<T>) {
	const { data, idField = "id" as keyof T, parentField = "parentId" as keyof T, childrenField = "children" as keyof T } = options;

	const expandedNodes = ref<Set<string>>(new Set());
	const selectedNodes = ref<Set<string>>(new Set());

	const buildTree = (items: T[], parentId: string | null = null, level = 0): TreeNode<T>[] => {
		return items
			.filter((item) => {
				const parentValue = item[parentField];
				return parentId === null ? parentValue === null || parentValue === undefined : parentValue === parentId;
			})
			.map((item) => ({
				id: String(item[idField]),
				data: item,
				children: buildTree(items, String(item[idField]), level + 1),
				isExpanded: false,
				level,
				parentId: parentId || undefined,
			}));
	};

	const treeData = computed(() => buildTree(data));

	const flattenTree = (nodes: TreeNode<T>[]): TreeNode<T>[] => {
		const result: TreeNode<T>[] = [];

		const flatten = (node: TreeNode<T>) => {
			result.push(node);
			if (node.isExpanded && node.children) {
				node.children.forEach(flatten);
			}
		};

		nodes.forEach(flatten);
		return result;
	};

	const flattenedData = computed(() => flattenTree(treeData.value));

	const toggleNode = (nodeId: string) => {
		if (expandedNodes.value.has(nodeId)) {
			expandedNodes.value.delete(nodeId);
		} else {
			expandedNodes.value.add(nodeId);
		}
	};

	const expandNode = (nodeId: string) => {
		expandedNodes.value.add(nodeId);
	};

	const collapseNode = (nodeId: string) => {
		expandedNodes.value.delete(nodeId);
	};

	const expandAll = () => {
		const expand = (nodes: TreeNode<T>[]) => {
			nodes.forEach((node) => {
				expandedNodes.value.add(node.id);
				if (node.children) {
					expand(node.children);
				}
			});
		};
		expand(treeData.value);
	};

	const collapseAll = () => {
		expandedNodes.value.clear();
	};

	const selectNode = (nodeId: string) => {
		selectedNodes.value.clear();
		selectedNodes.value.add(nodeId);
	};

	const toggleSelectNode = (nodeId: string) => {
		if (selectedNodes.value.has(nodeId)) {
			selectedNodes.value.delete(nodeId);
		} else {
			selectedNodes.value.add(nodeId);
		}
	};

	const deselectAll = () => {
		selectedNodes.value.clear();
	};

	const isExpanded = (nodeId: string) => expandedNodes.value.has(nodeId);
	const isSelected = (nodeId: string) => selectedNodes.value.has(nodeId);

	return {
		treeData,
		flattenedData,
		expandedNodes,
		selectedNodes,
		toggleNode,
		expandNode,
		collapseNode,
		expandAll,
		collapseAll,
		selectNode,
		toggleSelectNode,
		deselectAll,
		isExpanded,
		isSelected,
	};
}
