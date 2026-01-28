import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./test/setup.ts"],
		ssr: {
			noExternal: ["vue", "@vueuse/core"],
		},
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"vue": "vue/dist/vue.esm-bundler.js",
		},
	},
});
