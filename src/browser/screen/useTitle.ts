import { onUnmounted, ref, watch } from "vue";

export interface UseTitleOptions {
	restoreOnUnmount?: boolean;
	titleTemplate?: string | ((title?: string) => string);
}

export function useTitle(initialTitle?: string, options: UseTitleOptions = {}) {
	const { restoreOnUnmount = true, titleTemplate = "%s" } = options;

	const title = ref(initialTitle || document.title);
	const originalTitle = ref(document.title);

	const formatTitle = (newTitle?: string): string => {
		if (typeof titleTemplate === "function") {
			return titleTemplate(newTitle);
		}

		if (titleTemplate.includes("%s")) {
			return titleTemplate.replace("%s", newTitle || "");
		}

		return newTitle || titleTemplate;
	};

	const setTitle = (newTitle?: string) => {
		title.value = newTitle || "";
		document.title = formatTitle(newTitle);
	};

	watch(title, (newTitle) => {
		document.title = formatTitle(newTitle);
	});

	const restore = () => {
		title.value = originalTitle.value;
		document.title = originalTitle.value;
	};

	onUnmounted(() => {
		if (restoreOnUnmount) {
			restore();
		}
	});

	return {
		title,
		setTitle,
		restore,
	};
}
