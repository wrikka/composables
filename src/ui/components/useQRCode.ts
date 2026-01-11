import { computed, ref } from "vue";

export interface QRCodeOptions {
	width?: number;
	height?: number;
	colorDark?: string;
	colorLight?: string;
	correctLevel?: "L" | "M" | "Q" | "H";
}

// Simple QR code generation (placeholder implementation)
// In a real implementation, you would use a QR code library like qrcode.js
const generateQRCodeImpl = (text: string, options: QRCodeOptions): string => {
	// This is a placeholder implementation
	// In production, you would use a proper QR code library
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d")!;

	canvas.width = options.width || 256;
	canvas.height = options.height || 256;

	// Fill background
	ctx.fillStyle = options.colorLight || "#ffffff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Draw placeholder QR pattern
	ctx.fillStyle = options.colorDark || "#000000";
	const moduleSize = Math.min(canvas.width, canvas.height) / 25;
	const modules = 25;

	for (let row = 0; row < modules; row++) {
		for (let col = 0; col < modules; col++) {
			// Simple pattern based on text hash
			const hash = text
				.split("")
				.reduce((acc, char) => acc + char.charCodeAt(0), 0);
			const shouldFill = (row * col + hash) % 3 !== 0;

			if (shouldFill) {
				ctx.fillRect(
					col * moduleSize,
					row * moduleSize,
					moduleSize,
					moduleSize,
				);
			}
		}
	}

	return canvas.toDataURL();
};

export function useQRCode(text: string, options: QRCodeOptions = {}) {
	const {
		width = 256,
		height = 256,
		colorDark = "#000000",
		colorLight = "#ffffff",
		correctLevel = "M",
	} = options;

	const qrText = ref(text);
	const qrOptions = ref({ width, height, colorDark, colorLight, correctLevel });

	const qrCode = computed(() => {
		return generateQRCodeImpl(qrText.value, qrOptions.value);
	});

	const updateText = (newText: string) => {
		qrText.value = newText;
	};

	const updateOptions = (newOptions: Partial<QRCodeOptions>) => {
		qrOptions.value = { ...qrOptions.value, ...newOptions };
	};

	const downloadQRCode = (filename?: string) => {
		const link = document.createElement("a");
		link.download = filename || "qrcode.png";
		link.href = qrCode.value;
		link.click();
	};

	return {
		qrText,
		qrOptions,
		qrCode,
		updateText,
		updateOptions,
		downloadQRCode,
	};
}

// Advanced QR code with error correction
export function useAdvancedQRCode() {
	const text = ref("");
	const options = ref<QRCodeOptions>({
		width: 256,
		height: 256,
		colorDark: "#000000",
		colorLight: "#ffffff",
		correctLevel: "M",
	});

	const isGenerating = ref(false);
	const error = ref<string | null>(null);

	const qrCode = computed(() => {
		if (!text.value) return null;

		try {
			isGenerating.value = true;
			error.value = null;
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d")!;

			canvas.width = options.value.width || 256;
			canvas.height = options.value.height || 256;

			// Fill background
			ctx.fillStyle = options.value.colorLight || "#ffffff";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Draw placeholder QR pattern
			ctx.fillStyle = options.value.colorDark || "#000000";
			const moduleSize = Math.min(canvas.width, canvas.height) / 25;
			const modules = 25;

			for (let row = 0; row < modules; row++) {
				for (let col = 0; col < modules; col++) {
					// Simple pattern based on text hash
					const hash = text.value
						.split("")
						.reduce((acc, char) => acc + char.charCodeAt(0), 0);
					const shouldFill = (row * col + hash) % 3 !== 0;

					if (shouldFill) {
						ctx.fillRect(
							col * moduleSize,
							row * moduleSize,
							moduleSize - 1,
							moduleSize - 1,
						);
					}
				}
			}

			return canvas.toDataURL();
		} catch (err) {
			error.value =
				err instanceof Error ? err.message : "Failed to generate QR code";
			return null;
		} finally {
			isGenerating.value = false;
		}
	});

	const generate = (newText: string, newOptions?: Partial<QRCodeOptions>) => {
		text.value = newText;
		if (newOptions) {
			options.value = { ...options.value, ...newOptions };
		}
	};

	const clear = () => {
		text.value = "";
		error.value = null;
	};

	return {
		text,
		options,
		qrCode,
		isGenerating,
		error,
		generate,
		clear,
	};
}

// Batch QR code generation
export function useBatchQRCode() {
	const items = ref<Array<{ id: string; text: string; qrCode?: string }>>([]);
	const isGenerating = ref(false);
	const progress = ref(0);
	const options = ref<QRCodeOptions>({
		width: 256,
		height: 256,
		colorDark: "#000000",
		colorLight: "#ffffff",
		correctLevel: "M",
	});

	const generateBatch = async (
		texts: string[],
		batchOptions?: Partial<QRCodeOptions>,
	) => {
		isGenerating.value = true;
		progress.value = 0;

		if (batchOptions) {
			options.value = { ...options.value, ...batchOptions };
		}

		items.value = texts.map((text, index) => ({
			id: `qr-${index}`,
			text,
		}));

		try {
			for (let i = 0; i < items.value.length; i++) {
				const item = items.value[i];
				if (item) {
					item.qrCode = generateQRCodeImpl(item.text, options.value);
					progress.value = ((i + 1) / texts.length) * 100;

					// Allow UI to update
					await new Promise((resolve) => setTimeout(resolve, 0));
				}
			}
		} catch (err) {
			console.error("Batch generation failed:", err);
		} finally {
			isGenerating.value = false;
		}
	};

	const downloadAll = () => {
		items.value.forEach((item, index) => {
			if (item.qrCode) {
				const link = document.createElement("a");
				link.download = `qrcode-${index + 1}.png`;
				link.href = item.qrCode;
				link.click();
			}
		});
	};

	const clear = () => {
		items.value = [];
		progress.value = 0;
	};

	return {
		items,
		isGenerating,
		progress,
		options,
		generateBatch,
		downloadAll,
		clear,
	};
}
