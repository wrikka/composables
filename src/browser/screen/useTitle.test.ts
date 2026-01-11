import { afterEach, describe, expect, it } from "vitest";
import { useTitle } from "./useTitle";

describe("useTitle", () => {
	const initialTitle = document.title;

	afterEach(() => {
		document.title = initialTitle;
	});

	it("should set document title", () => {
		useTitle("New Title");
		expect(document.title).toBe("New Title");
	});

	it("should be reactive when the returned ref is changed", async () => {
		const { title } = useTitle("Initial Title");

		expect(document.title).toBe("Initial Title");

		title.value = "Updated Title";
		await new Promise((resolve) => setTimeout(resolve, 0)); // wait for next tick
		expect(document.title).toBe("Updated Title");
	});
});
