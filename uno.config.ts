import { defineConfig, presetIcons, presetWind4 } from "unocss";

export default defineConfig({
	presets: [
		presetWind4({
			preflights: {
				reset: true,
			},
		}),
		presetIcons({
			collections: {
				mdi: () =>
					import("@iconify-json/mdi/icons.json").then((i) => i.default),
			},
		}),
	],
	shortcuts: {
		"btn-primary":
			"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",
		"btn-secondary":
			"px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors",
		card: "bg-white rounded-lg shadow p-6",
		"sidebar-item":
			"w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors",
	},
	theme: {
		colors: {
			primary: "#3b82f6",
			secondary: "#64748b",
			accent: "#10b981",
		},
	},
});
