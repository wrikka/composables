import { onMounted, onUnmounted, type Ref, ref } from "vue";

interface UseDropZoneReturn {
	isOverDropZone: Ref<boolean>;
}

export function useDropZone(
	target: Ref<HTMLElement | null>,
	onDrop?: (files: File[] | null) => void,
): UseDropZoneReturn {
	const isOverDropZone = ref(false);

	const onDragEnter = (event: DragEvent) => {
		event.preventDefault();
		isOverDropZone.value = true;
	};

	const onDragOver = (event: DragEvent) => {
		event.preventDefault();
	};

	const onDragLeave = (event: DragEvent) => {
		event.preventDefault();
		isOverDropZone.value = false;
	};

	const onDropHandler = (event: DragEvent) => {
		event.preventDefault();
		isOverDropZone.value = false;
		const files = event.dataTransfer?.files;
		onDrop?.(files ? Array.from(files) : null);
	};

	onMounted(() => {
		const el = target.value;
		if (el) {
			el.addEventListener("dragenter", onDragEnter);
			el.addEventListener("dragover", onDragOver);
			el.addEventListener("dragleave", onDragLeave);
			el.addEventListener("drop", onDropHandler);
		}
	});

	onUnmounted(() => {
		const el = target.value;
		if (el) {
			el.removeEventListener("dragenter", onDragEnter);
			el.removeEventListener("dragover", onDragOver);
			el.removeEventListener("dragleave", onDragLeave);
			el.removeEventListener("drop", onDropHandler);
		}
	});

	return { isOverDropZone };
}
