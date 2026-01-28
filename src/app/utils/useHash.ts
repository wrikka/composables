import { type Ref, ref, unref, watchEffect } from "vue";

export function useHash(
	text: Ref<string> | string,
	algorithm: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" = "SHA-256",
) {
	const hash = ref("");
	const isSupported = "crypto" in window && "subtle" in window.crypto;

	watchEffect(async () => {
		if (isSupported) {
			const data = new TextEncoder().encode(unref(text));
			const buffer = await window.crypto.subtle.digest(algorithm, data);
			const hashArray = Array.from(new Uint8Array(buffer));
			hash.value = hashArray
				.map((b) => b.toString(16).padStart(2, "0"))
				.join("");
		}
	});

	return { hash, isSupported };
}
