import { beforeEach, describe, expect, it } from "vitest";
import { useSessionStorage } from "./useSessionStorage";

describe("useSessionStorage", () => {
	beforeEach(() => {
		sessionStorage.clear();
	});

	it("should initialize with a default value if sessionStorage is empty", () => {
		const { value } = useSessionStorage("my-key", "default");
		expect(value.value).toBe("default");
	});

	it("should initialize with the value from sessionStorage if it exists", () => {
		sessionStorage.setItem("my-key", JSON.stringify("stored value"));
		const { value } = useSessionStorage("my-key", "default");
		expect(value.value).toBe("stored value");
	});

	it("should update sessionStorage when the ref changes", async () => {
		const { value } = useSessionStorage("my-key", "initial");
		value.value = "updated";
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(sessionStorage.getItem("my-key")).toBe(JSON.stringify("updated"));
	});

	it("should handle object values", async () => {
		const { value } = useSessionStorage("my-key", { a: 1 });
		expect(value.value).toEqual({ a: 1 });

		value.value.a = 2;
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(sessionStorage.getItem("my-key")).toBe(JSON.stringify({ a: 2 }));
	});
});
