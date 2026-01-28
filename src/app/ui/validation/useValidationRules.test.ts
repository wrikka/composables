import { describe, expect, it } from "vitest";
import {
	email,
	maxLength,
	minLength,
	required,
	sameAs,
} from "./useValidationRules";

describe("useValidationRules", () => {
	describe("required", () => {
		const rule = required("Required");

		it("should return true for non-empty values", () => {
			expect(rule.validate("text")).toBe(true);
			expect(rule.validate(123)).toBe(true);
			expect(rule.validate(["item"])).toBe(true);
			expect(rule.validate({ key: "value" })).toBe(true);
		});

		it("should return the message for empty or invalid values", () => {
			expect(rule.validate("")).toBe("Required");
			expect(rule.validate("   ")).toBe("Required");
			expect(rule.validate(null)).toBe("Required");
			expect(rule.validate(undefined)).toBe("Required");
			expect(rule.validate([])).toBe("Required");
		});
	});

	describe("email", () => {
		const rule = email("Invalid email");

		it("should return true for valid email addresses", () => {
			expect(rule.validate("test@example.com")).toBe(true);
			expect(rule.validate("user.name+tag@domain.co.uk")).toBe(true);
		});

		it("should return the message for invalid email addresses", () => {
			expect(rule.validate("plainaddress")).toBe("Invalid email");
			expect(rule.validate("@missing-local-part.com")).toBe("Invalid email");
			expect(rule.validate("domain.com")).toBe("Invalid email");
			expect(rule.validate("test@domain")).toBe("Invalid email");
		});
	});

	describe("minLength", () => {
		const rule = minLength(5);

		it("should return true for strings with length greater than or equal to min", () => {
			expect(rule.validate("abcde")).toBe(true);
			expect(rule.validate("abcdef")).toBe(true);
		});

		it("should return the default message for strings with length less than min", () => {
			expect(rule.validate("abcd")).toBe("Must be at least 5 characters");
		});

		it("should return a custom message if provided", () => {
			const customRule = minLength(5, "Too short");
			expect(customRule.validate("abcd")).toBe("Too short");
		});
	});

	describe("maxLength", () => {
		const rule = maxLength(5);

		it("should return true for strings with length less than or equal to max", () => {
			expect(rule.validate("abcde")).toBe(true);
			expect(rule.validate("abcd")).toBe(true);
		});

		it("should return the default message for strings with length greater than max", () => {
			expect(rule.validate("abcdef")).toBe("Must be 5 characters or less");
		});

		it("should return a custom message if provided", () => {
			const customRule = maxLength(5, "Too long");
			expect(customRule.validate("abcdef")).toBe("Too long");
		});
	});

	describe("sameAs", () => {
		const rule = sameAs("password123", "Password");

		it("should return true if values are the same", () => {
			expect(rule.validate("password123")).toBe(true);
		});

		it("should return the message if values are not the same", () => {
			expect(rule.validate("different")).toBe("Does not match Password");
		});
	});
});
