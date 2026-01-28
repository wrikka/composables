import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useDerivedState } from "./useDerivedState";

describe("useDerivedState", () => {
	it("should derive state from ref", () => {
		const source = ref(10);
		const { derived } = useDerivedState(source, (value) => value * 2);

		expect(derived.value).toBe(20);

		source.value = 20;

		expect(derived.value).toBe(40);
	});

	it("should derive state from function", () => {
		let value = 10;
		const source = () => value;
		const { derived } = useDerivedState(source, (val) => val * 2);

		expect(derived.value).toBe(20);

		value = 20;

		expect(derived.value).toBe(40);
	});

	it("should work with complex objects", () => {
		const source = ref({ name: "test", age: 25 });
		const { derived } = useDerivedState(source, (value) => ({
			...value,
			canVote: value.age >= 18,
		}));

		expect(derived.value).toEqual({
			name: "test",
			age: 25,
			canVote: true,
		});

		source.value = { name: "young", age: 15 };

		expect(derived.value).toEqual({
			name: "young",
			age: 15,
			canVote: false,
		});
	});

	it("should work with arrays", () => {
		const source = ref([1, 2, 3]);
		const { derived } = useDerivedState(source, (value) => value.map((v) => v * 2));

		expect(derived.value).toEqual([2, 4, 6]);

		source.value = [4, 5, 6];

		expect(derived.value).toEqual([8, 10, 12]);
	});

	it("should provide derived computed ref", () => {
		const source = ref(10);
		const { derived } = useDerivedState(source, (value) => value * 2);

		expect(derived).toBeDefined();
	});
});
