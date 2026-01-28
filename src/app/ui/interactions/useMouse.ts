import { onMounted, onUnmounted, ref, readonly as vueReadonly } from "vue";

export interface MousePosition {
	x: number;
	y: number;
}

export interface UseMouseOptions {
	readonly?: boolean;
	type?: "page" | "client" | "screen" | "movement";
	target?: Window | Document | HTMLElement;
	handleOutside?: boolean;
}

export function useMouse(options: UseMouseOptions = {}) {
	const {
		readonly: isReadonly = false,
		type = "page",
		target = window,
		handleOutside = true,
	} = options;

	const x = ref(0);
	const y = ref(0);
	const sourceType = ref<UseMouseOptions["type"]>(type);

	const mouse = ref<MousePosition>({ x: 0, y: 0 });

	const getMousePosition = (event: MouseEvent): MousePosition => {
		switch (type) {
			case "page":
				return { x: event.pageX, y: event.pageY };
			case "client":
				return { x: event.clientX, y: event.clientY };
			case "screen":
				return { x: event.screenX, y: event.screenY };
			case "movement":
				return { x: event.movementX, y: event.movementY };
			default:
				return { x: event.pageX, y: event.pageY };
		}
	};

	const update = (event: MouseEvent) => {
		const pos = getMousePosition(event);

		if (handleOutside || isInsideElement(event, target as HTMLElement)) {
			x.value = pos.x;
			y.value = pos.y;
			mouse.value = pos;
		}
	};

	const isInsideElement = (
		event: MouseEvent,
		_element?: HTMLElement,
	): boolean => {
		if (!_element) return true;

		const rect = _element.getBoundingClientRect();
		return (
			event.clientX >= rect.left &&
			event.clientX <= rect.right &&
			event.clientY >= rect.top &&
			event.clientY <= rect.bottom
		);
	};

	onMounted(() => {
		target.addEventListener("mousemove", update as EventListener);
	});

	onUnmounted(() => {
		target.removeEventListener("mousemove", update as EventListener);
	});

	if (isReadonly) {
		return {
			x: vueReadonly(x),
			y: vueReadonly(y),
			mouse: vueReadonly(mouse),
			sourceType: vueReadonly(sourceType),
		};
	}

	return {
		x,
		y,
		mouse,
		sourceType,
	};
}
