import { describe, expect, it, vi } from "vitest";
import { useColor } from "./useColor";

vi.useFakeTimers();

describe("useColor", () => {
	it("should tween between two hex colors", () => {
		const from = "#ff0000"; // red
		const to = "#0000ff"; // blue
		const color = useColor(from, to, { duration: 1000 });

		expect(color.value).toBe("rgb(255, 0, 0)");

		vi.advanceTimersByTime(500);
		expect(color.value).toBe("rgb(128, 0, 128)"); // purple

		vi.advanceTimersByTime(500);
		expect(color.value).toBe("rgb(0, 0, 255)");
	});

	it("should tween between two rgb colors", () => {
		const from = "rgb(255, 0, 0)";
		const to = "rgb(0, 255, 0)";
		const color = useColor(from, to, { duration: 1000 });

		expect(color.value).toBe("rgb(255, 0, 0)");

		vi.advanceTimersByTime(500);
		expect(color.value).toBe("rgb(128, 128, 0)");

		vi.advanceTimersByTime(500);
		expect(color.value).toBe("rgb(0, 255, 0)");
	});

	it("should handle 3-digit hex colors", () => {
		const from = "#f00";
		const to = "#0f0";
		const color = useColor(from, to, { duration: 1000 });

		vi.advanceTimersByTime(1000);
		expect(color.value).toBe("rgb(0, 255, 0)");
	});
});
