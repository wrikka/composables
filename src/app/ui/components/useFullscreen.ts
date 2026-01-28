import { onMounted, onUnmounted, type Ref, readonly, ref } from "vue";

export function useFullscreen(target: Ref<HTMLElement | null>) {
	const isSupported = Boolean(
		typeof document !== "undefined" &&
			(document.fullscreenEnabled ||
				(document as any).mozFullScreenEnabled ||
				(document as any).webkitFullscreenEnabled ||
				(document as any).msFullscreenEnabled),
	);

	const isFullscreen = ref(false);

	const enter = async () => {
		if (!isSupported) return;
		const el = target.value;
		if (!el) return;

		if (el.requestFullscreen) await el.requestFullscreen();
		else if ((el as any).mozRequestFullScreen)
			await (el as any).mozRequestFullScreen();
		else if ((el as any).webkitRequestFullscreen)
			await (el as any).webkitRequestFullscreen();
		else if ((el as any).msRequestFullscreen)
			await (el as any).msRequestFullscreen();
	};

	const exit = async () => {
		if (!isSupported) return;
		if (document.exitFullscreen) await document.exitFullscreen();
		else if ((document as any).mozCancelFullScreen)
			await (document as any).mozCancelFullScreen();
		else if ((document as any).webkitExitFullscreen)
			await (document as any).webkitExitFullscreen();
		else if ((document as any).msExitFullscreen)
			await (document as any).msExitFullscreen();
	};

	const toggle = async () => {
		if (isFullscreen.value) await exit();
		else await enter();
	};

	const onFullscreenChange = () => {
		isFullscreen.value = Boolean(document.fullscreenElement);
	};

	onMounted(() => {
		if (isSupported) {
			document.addEventListener("fullscreenchange", onFullscreenChange);
		}
	});

	onUnmounted(() => {
		if (isSupported) {
			document.removeEventListener("fullscreenchange", onFullscreenChange);
		}
	});

	return {
		isSupported,
		isFullscreen: readonly(isFullscreen),
		enter,
		exit,
		toggle,
	};
}
