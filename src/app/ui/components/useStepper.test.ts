import { describe, it, expect } from "vitest";
import { useStepper } from "./useStepper";

describe("useStepper", () => {
	it("should initialize with first step", () => {
		const { currentIndex, isFirst, isLast } = useStepper({ totalSteps: 3 });

		expect(currentIndex.value).toBe(0);
		expect(isFirst.value).toBe(true);
		expect(isLast.value).toBe(false);
	});

	it("should go to next step", () => {
		const { currentIndex, next, isFirst } = useStepper({ totalSteps: 3 });

		next();
		expect(currentIndex.value).toBe(1);
		expect(isFirst.value).toBe(false);
	});

	it("should go to previous step", () => {
		const { currentIndex, next, previous, isLast } = useStepper({ totalSteps: 3 });

		next();
		next();
		expect(currentIndex.value).toBe(2);
		expect(isLast.value).toBe(true);

		previous();
		expect(currentIndex.value).toBe(1);
		expect(isLast.value).toBe(false);
	});

	it("should not go prev from first step", () => {
		const { currentIndex, previous } = useStepper({ totalSteps: 3 });

		expect(currentIndex.value).toBe(0);

		previous();
		expect(currentIndex.value).toBe(0);
	});

	it("should not go next from last step", () => {
		const { currentIndex, next } = useStepper({ totalSteps: 3 });

		next();
		next();
		expect(currentIndex.value).toBe(2);

		next();
		expect(currentIndex.value).toBe(2);
	});

	it("should go to specific step", () => {
		const { currentIndex, goTo, setTotalSteps } = useStepper({ totalSteps: 5 });

		setTotalSteps(5);
		goTo(2);
		expect(currentIndex.value).toBe(2);

		goTo(4);
		expect(currentIndex.value).toBe(4);
	});

	it("should reset to first step", () => {
		const { currentIndex, next, reset } = useStepper({ totalSteps: 3 });

		next();
		next();
		expect(currentIndex.value).toBe(2);

		reset();
		expect(currentIndex.value).toBe(0);
	});

	it("should calculate progress", () => {
		const { currentIndex, next, progress, setTotalSteps } = useStepper({ totalSteps: 4 });

		setTotalSteps(4);
		expect(progress.value).toBe(0);

		next();
		expect(progress.value).toBe(25);

		next();
		next();
		expect(progress.value).toBe(75);
	});

	it("should check if step is completed", () => {
		const { currentIndex, next } = useStepper({ totalSteps: 3 });

		next();
		expect(currentIndex.value).toBe(1);
	});
});
