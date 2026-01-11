import type { FormValidationRule } from "./types";

export const required = (
	message = "This field is required",
): FormValidationRule => ({
	validate: (value: any) => {
		if (Array.isArray(value)) return value.length > 0 || message;
		if (typeof value === "string") return value.trim().length > 0 || message;
		return (value !== null && value !== undefined && value !== "") || message;
	},
	message,
});

export const email = (
	message = "Invalid email address",
): FormValidationRule<string> => ({
	validate: (value: string) => {
		const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
		return regex.test(value) || message;
	},
	message,
});

export const minLength = (
	min: number,
	message?: string,
): FormValidationRule<string> => ({
	validate: (value: string) =>
		(value && value.length >= min) ||
		(message ?? `Must be at least ${min} characters`),
	message: message ?? `Must be at least ${min} characters`,
});

export const maxLength = (
	max: number,
	message?: string,
): FormValidationRule<string> => ({
	validate: (value: string) =>
		(value && value.length <= max) ||
		(message ?? `Must be ${max} characters or less`),
	message: message ?? `Must be ${max} characters or less`,
});

export const sameAs = (
	otherValue: any,
	otherName: string,
): FormValidationRule => ({
	validate: (value: any) =>
		value === otherValue || `Does not match ${otherName}`,
	message: `Does not match ${otherName}`,
});
