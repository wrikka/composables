import type { Ref } from "vue";
import { ref } from "vue";

export function useInlineEdit<T extends Record<string, any>>(
	item: Ref<T>,
	key: keyof T,
	onSave: (newItem: T) => Promise<void> | void,
) {
	const isEditing = ref(false);
	const value = ref(item.value[key]);
	const originalValue = ref(item.value[key]);

	const startEditing = () => {
		originalValue.value = item.value[key];
		value.value = item.value[key];
		isEditing.value = true;
	};

	const cancelEditing = () => {
		isEditing.value = false;
		value.value = originalValue.value;
	};

	const save = async () => {
		if (value.value === originalValue.value) {
			isEditing.value = false;
			return;
		}

		const newItem = { ...item.value, [key]: value.value };
		await onSave(newItem);
		isEditing.value = false;
		originalValue.value = value.value;
	};

	return {
		isEditing,
		value,
		startEditing,
		cancelEditing,
		save,
	};
}
