import { describe, expect, it } from "vitest";
import { useTimezone } from "./useTimezone";

describe("useTimezone", () => {
	it("should initialize with timezone info", () => {
		const { timezone, offset, dst, name, info } = useTimezone();

		expect(timezone.value).toBeDefined();
		expect(offset.value).toBeDefined();
		expect(dst.value).toBeDefined();
		expect(name.value).toBeDefined();
		expect(info.value).toBeDefined();
	});

	it("should return current timezone", () => {
		const { timezone } = useTimezone();

		expect(typeof timezone.value).toBe("string");
		expect(timezone.value.length).toBeGreaterThan(0);
	});

	it("should return timezone offset", () => {
		const { offset } = useTimezone();

		expect(typeof offset.value).toBe("number");
	});

	it("should return DST status", () => {
		const { dst } = useTimezone();

		expect(typeof dst.value).toBe("boolean");
	});

	it("should return timezone name", () => {
		const { name } = useTimezone();

		expect(typeof name.value).toBe("string");
	});

	it("should return complete timezone info", () => {
		const { info } = useTimezone();

		expect(info.value).toEqual({
			timezone: expect.any(String),
			offset: expect.any(Number),
			dst: expect.any(Boolean),
			name: expect.any(String),
		});
	});

	it("should convert date to target timezone", () => {
		const { convertToTimezone } = useTimezone();

		const date = new Date("2024-01-01T12:00:00Z");
		const result = convertToTimezone(date, "America/New_York");

		expect(result).toBeInstanceOf(Date);
	});

	it("should format date in timezone", () => {
		const { formatInTimezone } = useTimezone();

		const date = new Date("2024-01-01T12:00:00Z");
		const result = formatInTimezone(date, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});

		expect(typeof result).toBe("string");
	});

	it("should format date in specific timezone", () => {
		const { formatInTimezone } = useTimezone();

		const date = new Date("2024-01-01T12:00:00Z");
		const result = formatInTimezone(
			date,
			{
				year: "numeric",
				month: "long",
				day: "numeric",
			},
			"Asia/Tokyo",
		);

		expect(typeof result).toBe("string");
	});

	it("should provide convertToTimezone function", () => {
		const { convertToTimezone } = useTimezone();

		expect(convertToTimezone).toBeDefined();
		expect(typeof convertToTimezone).toBe("function");
	});

	it("should provide formatInTimezone function", () => {
		const { formatInTimezone } = useTimezone();

		expect(formatInTimezone).toBeDefined();
		expect(typeof formatInTimezone).toBe("function");
	});
});
