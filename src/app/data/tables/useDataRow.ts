import { ref, computed } from "vue";

interface RowAction<T> {
	key: string;
	label: string;
	icon?: string;
	handler: (row: T) => void;
	visible?: (row: T) => boolean;
	disabled?: (row: T) => boolean;
}

interface UseDataRowOptions<T> {
	actions?: RowAction<T>[];
}

export function useDataRow<T = any>(options: UseDataRowOptions<T> = {}) {
	const { actions = [] } = options;

	const activeRow = ref<T | null>(null);
	const hoveredRow = ref<T | null>(null);

	const getRowActions = (row: T): RowAction<T>[] => {
		return actions.filter((action) => {
			if (action.visible && !action.visible(row)) return false;
			return true;
		});
	};

	const isActionVisible = (row: T, action: RowAction<T>): boolean => {
		if (action.visible) {
			return action.visible(row);
		}
		return true;
	};

	const isActionDisabled = (row: T, action: RowAction<T>): boolean => {
		if (action.disabled) {
			return action.disabled(row);
		}
		return false;
	};

	const executeAction = (row: T, actionKey: string) => {
		const action = actions.find((a) => a.key === actionKey);
		if (action && !isActionDisabled(row, action)) {
			action.handler(row);
		}
	};

	const setActiveRow = (row: T | null) => {
		activeRow.value = row;
	};

	const setHoveredRow = (row: T | null) => {
		hoveredRow.value = row;
	};

	const hasActions = computed(() => actions.length > 0);

	return {
		actions,
		activeRow,
		hoveredRow,
		hasActions,
		getRowActions,
		isActionVisible,
		isActionDisabled,
		executeAction,
		setActiveRow,
		setHoveredRow,
	};
}
