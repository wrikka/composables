import { ref } from "vue";

export interface Notification {
	id: string;
	title: string;
	message: string;
	type?: "success" | "error" | "warning" | "info";
	duration?: number;
	persistent?: boolean;
	action?: {
		label: string;
		handler: () => void;
	};
	timestamp: number;
}

export interface UseNotificationOptions {
	maxNotifications?: number;
	defaultDuration?: number;
	position?:
		| "top-right"
		| "top-left"
		| "bottom-right"
		| "bottom-left"
		| "top-center"
		| "bottom-center";
}

export function useNotification(options: UseNotificationOptions = {}) {
	const {
		maxNotifications = 5,
		defaultDuration = 5000,
		position = "top-right",
	} = options;

	const notifications = ref<Notification[]>([]);
	const positionRef = ref(position);

	const generateId = () =>
		`notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	const show = (
		notification: Omit<Notification, "id" | "timestamp">,
	): string => {
		const id = generateId();
		const newNotification: Notification = {
			...notification,
			id,
			timestamp: Date.now(),
			duration: notification.duration ?? defaultDuration,
		};

		// Add notification
		notifications.value.push(newNotification);

		// Limit notifications
		if (notifications.value.length > maxNotifications) {
			notifications.value.shift();
		}

		// Auto-remove if not persistent
		if (
			!notification.persistent &&
			newNotification.duration &&
			newNotification.duration > 0
		) {
			setTimeout(() => {
				remove(id);
			}, newNotification.duration);
		}

		return id;
	};

	const remove = (id: string) => {
		const index = notifications.value.findIndex((n) => n.id === id);
		if (index > -1) {
			notifications.value.splice(index, 1);
		}
	};

	const clear = () => {
		notifications.value = [];
	};

	const success = (
		title: string,
		message: string,
		options?: Partial<
			Omit<Notification, "id" | "timestamp" | "title" | "type" | "message">
		>,
	) => {
		return show({ title, message, type: "success", ...options });
	};

	const error = (
		title: string,
		message: string,
		options?: Partial<
			Omit<Notification, "id" | "timestamp" | "title" | "type" | "message">
		>,
	) => {
		return show({
			title,
			message,
			type: "error",
			persistent: true,
			...options,
		});
	};

	const warning = (
		title: string,
		message: string,
		options?: Partial<
			Omit<Notification, "id" | "timestamp" | "title" | "type" | "message">
		>,
	) => {
		return show({ title, message, type: "warning", ...options });
	};

	const info = (
		title: string,
		message: string,
		options?: Partial<
			Omit<Notification, "id" | "timestamp" | "title" | "type" | "message">
		>,
	) => {
		return show({ title, message, type: "info", ...options });
	};

	const update = (
		id: string,
		updates: Partial<Omit<Notification, "id" | "timestamp">>,
	) => {
		const notification = notifications.value.find((n) => n.id === id);
		if (notification) {
			Object.assign(notification, updates);
		}
	};

	const pause = (id: string) => {
		update(id, { duration: 0 });
	};

	const resume = (id: string, duration?: number) => {
		const notification = notifications.value.find((n) => n.id === id);
		if (notification && !notification.persistent) {
			const resumeDuration = duration ?? defaultDuration;
			update(id, { duration: resumeDuration });

			setTimeout(() => {
				remove(id);
			}, resumeDuration);
		}
	};

	const setPosition = (newPosition: UseNotificationOptions["position"]) => {
		positionRef.value = newPosition ?? "top-right";
	};

	return {
		notifications,
		position: positionRef,
		show,
		remove,
		clear,
		success,
		error,
		warning,
		info,
		update,
		pause,
		resume,
		setPosition,
	};
}

// Notification store for global usage
let globalNotification: ReturnType<typeof useNotification> | null = null;

export function useGlobalNotification(options?: UseNotificationOptions) {
	if (!globalNotification) {
		globalNotification = useNotification(options);
	}
	return globalNotification;
}
