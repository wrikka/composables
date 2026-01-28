import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFavicon } from "./useFavicon";

describe("useFavicon", () => {
	let mockHead: any;
	let mockLink: any;

	beforeEach(() => {
		mockLink = {
			rel: "",
			href: "",
			sizes: undefined,
			type: undefined,
		};

		mockHead = {
			appendChild: vi.fn(),
			removeChild: vi.fn(),
		};

		Object.defineProperty(document, "head", {
			value: mockHead,
			writable: true,
		});

		Object.defineProperty(document, "querySelector", {
			value: vi.fn().mockReturnValue(mockLink),
			writable: true,
		});

		vi.clearAllMocks();
	});

	it("should initialize with default values", () => {
		const { favicon } = useFavicon();

		expect(favicon.value).toBe("");
	});

	it("should initialize with provided href", () => {
		const { favicon } = useFavicon("/favicon.ico");

		expect(favicon.value).toBe("/favicon.ico");
	});

	it("should set favicon", () => {
		const { setFavicon, favicon } = useFavicon();

		setFavicon("/new-favicon.ico");

		expect(favicon.value).toBe("/new-favicon.ico");
		expect(mockLink.href).toBe("/new-favicon.ico");
	});

	it("should use base URL", () => {
		const { setFavicon } = useFavicon("", { baseUrl: "https://example.com" });

		setFavicon("/favicon.ico");

		expect(mockLink.href).toBe("https://example.com/favicon.ico");
	});

	it("should set rel attribute", () => {
		const { setFavicon } = useFavicon("", { rel: "icon" });

		setFavicon("/favicon.ico");

		expect(mockLink.rel).toBe("icon");
	});

	it("should set sizes attribute", () => {
		const { setFavicon } = useFavicon("", { sizes: "32x32" });

		setFavicon("/favicon.ico");

		expect(mockLink.sizes).toBe("32x32");
	});

	it("should set type attribute", () => {
		const { setFavicon } = useFavicon("", { type: "image/x-icon" });

		setFavicon("/favicon.ico");

		expect(mockLink.type).toBe("image/x-icon");
	});

	it("should reset favicon", () => {
		const { setFavicon, resetFavicon, favicon } = useFavicon();

		setFavicon("/favicon.ico");
		resetFavicon();

		expect(favicon.value).toBe("");
		expect(mockHead.removeChild).toHaveBeenCalledWith(mockLink);
	});

	it("should create new link element if none exists", () => {
		vi.spyOn(document, "querySelector").mockReturnValue(null);

		const { setFavicon } = useFavicon();

		setFavicon("/favicon.ico");

		expect(mockHead.appendChild).toHaveBeenCalled();
	});

	it("should handle empty favicon", () => {
		const { setFavicon, favicon } = useFavicon();

		setFavicon("");

		expect(favicon.value).toBe("");
		expect(mockHead.removeChild).toHaveBeenCalledWith(mockLink);
	});
});
