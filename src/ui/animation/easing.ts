export type EasingFunction = (n: number) => number;

export const linear: EasingFunction = (n) => n;

export const easeInQuad: EasingFunction = (n) => n * n;

export const easeOutQuad: EasingFunction = (n) => n * (2 - n);

export const easeInOutQuad: EasingFunction = (n) =>
	n < 0.5 ? 2 * n * n : -1 + (4 - 2 * n) * n;

export const easeInCubic: EasingFunction = (n) => n * n * n;

export const easeOutCubic: EasingFunction = (n) => --n * n * n + 1;

export const easeInOutCubic: EasingFunction = (n) =>
	n < 0.5 ? 4 * n * n * n : (n - 1) * (2 * n - 2) * (2 * n - 2) + 1;
