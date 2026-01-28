import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useDraggableRows } from "./useDraggableRows";

describe("useDraggableRows", () => {
	const initialData = [
		{ id: 1, name: "Alice" },
		{ id: 2, name: "Bob" },
		{ id: 3, name: "Charlie" },
	];

	it("should initialize with the provided data", () => {
		const data = ref([...initialData]);
		const { list } = useDraggableRows(data);
		expect(list.value).toEqual(initialData);
	});

	it("should reorder the list on drop", () => {
		const data = ref([...initialData]);
		const { list, onDragStart, onDrop } = useDraggableRows(data);

		const itemToDrag = data.value[0]!; // Alice
		const targetItem = data.value[2]!; // Charlie

		onDragStart(itemToDrag);
		onDrop(targetItem);

		expect(list.value.map((i) => i.id)).toEqual([2, 3, 1]);
		expect(data.value.map((i) => i.id)).toEqual([2, 3, 1]); // Original data should be updated
	});

	it("should not change order if dropping on the same item", () => {
		const data = ref([...initialData]);
		const { list, onDragStart, onDrop } = useDraggableRows(data);

		const itemToDrag = data.value[1]!; // Bob
		const targetItem = data.value[1]!; // Bob

		onDragStart(itemToDrag);
		onDrop(targetItem);

		expect(list.value.map((i) => i.id)).toEqual([1, 2, 3]);
	});

	it("should handle dragging from bottom to top", () => {
		const data = ref([...initialData]);
		const { list, onDragStart, onDrop } = useDraggableRows(data);

		const itemToDrag = data.value[2]!; // Charlie
		const targetItem = data.value[0]!; // Alice

		onDragStart(itemToDrag);
		onDrop(targetItem);

		expect(list.value.map((i) => i.id)).toEqual([3, 1, 2]);
	});
});
