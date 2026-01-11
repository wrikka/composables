import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUrl } from "./useUrl";

describe("useUrl", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with current URL in browser", () => {
		vi.stubGlobal("window", {
			location: { href: "https://example.com:3000/path?param=value#hash" },
		});

		const { url, protocol, hostname, port, pathname, search, hash, params } =
			useUrl();

		expect(url.value).toBe("https://example.com:3000/path?param=value#hash");
		expect(protocol.value).toBe("https:");
		expect(hostname.value).toBe("example.com");
		expect(port.value).toBe("3000");
		expect(pathname.value).toBe("/path");
		expect(search.value).toBe("?param=value");
		expect(hash.value).toBe("#hash");
		expect(params.value).toEqual({ param: "value" });

		vi.unstubAllGlobals();
	});

	it("should initialize with empty URL outside browser", () => {
		vi.stubGlobal("window", undefined);

		const { url } = useUrl();
		expect(url.value).toBe("");

		vi.unstubAllGlobals();
	});

	it("should set URL", () => {
		const { url, setUrl } = useUrl();

		setUrl("https://newexample.com/newpath");
		expect(url.value).toBe("https://newexample.com/newpath");
	});

	it("should set URL parameters", () => {
		const { url, setUrl, setParam, getParam, hasParam } = useUrl();

		setUrl("https://example.com/path");
		setParam("key", "value");

		expect(url.value).toBe("https://example.com/path?key=value");
		expect(getParam("key")).toBe("value");
		expect(hasParam("key")).toBe(true);
		expect(hasParam("nonexistent")).toBe(false);
	});

	it("should remove URL parameters", () => {
		const { url, setUrl, removeParam, getParam } = useUrl();

		setUrl("https://example.com/path?key=value");
		removeParam("key");

		expect(url.value).toBe("https://example.com/path");
		expect(getParam("key")).toBe(null);
	});

	it("should handle multiple parameters", () => {
		const { url, setUrl, setParam, params } = useUrl();

		setUrl("https://example.com/path");
		setParam("param1", "value1");
		setParam("param2", "value2");

		expect(params.value).toEqual({ param1: "value1", param2: "value2" });
		expect(url.value).toBe(
			"https://example.com/path?param1=value1&param2=value2",
		);
	});

	it("should build URLs", () => {
		const { buildUrl } = useUrl({ base: "https://example.com" });

		const url1 = buildUrl("/path");
		expect(url1).toBe("https://example.com/path");

		const url2 = buildUrl("/path", { param: "value" });
		expect(url2).toBe("https://example.com/path?param=value");
	});

	it("should handle invalid URLs gracefully", () => {
		const { url, setUrl, setParam, protocol, hostname } = useUrl();

		setUrl("invalid-url");
		expect(protocol.value).toBe("");
		expect(hostname.value).toBe("");

		// Should not throw error
		setParam("key", "value");
		expect(url.value).toBe("invalid-url");
	});

	it("should update computed properties when URL changes", () => {
		const { url, pathname, hostname } = useUrl();

		url.value = "https://newsite.com/newpath";
		expect(pathname.value).toBe("/newpath");
		expect(hostname.value).toBe("newsite.com");
	});
});
