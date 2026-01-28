import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGlobalNotification, useNotification } from "./useNotification";

describe("useNotification", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it("should initialize with empty notifications", () => {
		const { notifications, position } = useNotification();

		expect(notifications.value).toEqual([]);
		expect(position.value).toBe("top-right");
	});

	it("should show notification", () => {
		const { notifications, show } = useNotification();

		const id = show({
			title: "Test Notification",
			message: "This is a test",
			type: "info",
		});

		expect(notifications.value).toHaveLength(1);
		expect(notifications.value[0]).toMatchObject({
			id,
			title: "Test Notification",
			message: "This is a test",
			type: "info",
		});
		expect(notifications.value[0]).toBeDefined();
		expect(typeof notifications.value[0]?.timestamp).toBe("number");
	});

	it("should use default duration", () => {
		const { notifications, show } = useNotification({ defaultDuration: 3000 });

		show({
			title: "Test",
			message: "Test message",
			type: "info",
		});

		expect(notifications.value[0]).toBeDefined();
		expect(notifications.value[0]?.duration).toBe(3000);
	});

	it("should auto-remove notification after duration", () => {
		const { notifications, show } = useNotification({ defaultDuration: 5000 });

		show({
			title: "Test",
			message: "Test message",
			type: "info",
		});

		expect(notifications.value).toHaveLength(1);

		vi.advanceTimersByTime(5000);
		expect(notifications.value).toHaveLength(0);
	});

	it("should not auto-remove persistent notification", () => {
		const { notifications, show } = useNotification();

		show({
			title: "Test",
			message: "Test message",
			type: "info",
			persistent: true,
		});

		expect(notifications.value).toHaveLength(1);

		vi.advanceTimersByTime(10000);
		expect(notifications.value).toHaveLength(1);
	});

	it("should limit max notifications", () => {
		const { notifications, show } = useNotification({ maxNotifications: 2 });

		show({ title: "1", message: "Message 1", type: "info" });
		show({ title: "2", message: "Message 2", type: "info" });
		show({ title: "3", message: "Message 3", type: "info" });

		expect(notifications.value).toHaveLength(2);
		expect(notifications.value.map((n) => n.title)).toEqual(["2", "3"]);
	});

	it("should remove notification manually", () => {
		const { notifications, show, remove } = useNotification();

		const id = show({ title: "Test", message: "Test message", type: "info" });
		expect(notifications.value).toHaveLength(1);

		remove(id);
		expect(notifications.value).toHaveLength(0);
	});

	it("should clear all notifications", () => {
		const { notifications, show, clear } = useNotification();

		show({ title: "1", message: "Message 1", type: "info" });
		show({ title: "2", message: "Message 2", type: "info" });
		expect(notifications.value).toHaveLength(2);

		clear();
		expect(notifications.value).toHaveLength(0);
	});

	it("should provide convenience methods", () => {
		const { notifications, success, error, warning, info } = useNotification();

		success("Success", "Success message");
		error("Error", "Error message");
		warning("Warning", "Warning message");
		info("Info", "Info message");

		expect(notifications.value).toHaveLength(4);
		expect(notifications.value[0]?.type).toBe("success");
		expect(notifications.value[1]?.type).toBe("error");
		expect(notifications.value[2]?.type).toBe("warning");
		expect(notifications.value[3]?.type).toBe("info");
	});

	it("should make error notifications persistent by default", () => {
		const { notifications, error } = useNotification();

		error("Error", "Error message");
		expect(notifications.value[0]).toBeDefined();
		expect(notifications.value[0]?.persistent).toBe(true);
	});

	it("should update notification", () => {
		const { notifications, show, update } = useNotification();

		const id = show({
			title: "Original",
			message: "Original message",
			type: "info",
		});
		update(id, { title: "Updated", message: "New message" });

		expect(notifications.value[0]).toMatchObject({
			title: "Updated",
			message: "New message",
		});
	});

	it("should pause and resume notifications", () => {
		const { notifications, show, pause, resume } = useNotification({
			defaultDuration: 5000,
		});

		const id = show({ title: "Test", message: "Test message", type: "info" });
		expect(notifications.value[0]).toBeDefined();
		expect(notifications.value[0]?.duration).toBe(5000);

		pause(id);
		expect(notifications.value[0]?.duration).toBe(0);

		resume(id, 3000);
		expect(notifications.value[0]?.duration).toBe(3000);

		vi.advanceTimersByTime(3000);
		expect(notifications.value).toHaveLength(0);
	});

	it("should handle notification actions", () => {
		const actionHandler = vi.fn();
		const { notifications, show } = useNotification();

		show({
			title: "Test",
			message: "Test message",
			type: "info",
			action: {
				label: "Click me",
				handler: actionHandler,
			},
		});

		// Simulate action click
		const notification = notifications.value[0];
		if (notification?.action) {
			notification.action.handler();
		}

		expect(actionHandler).toHaveBeenCalled();
	});

	it("should set position", () => {
		const { position, setPosition } = useNotification();

		setPosition("bottom-left");
		expect(position.value).toBe("bottom-left");

		setPosition("top-center");
		expect(position.value).toBe("top-center");
	});

	it("should use custom options", () => {
		const { notifications, show, position } = useNotification({
			maxNotifications: 3,
			defaultDuration: 2000,
			position: "bottom-left",
		});

		show({ title: "Test", message: "Test message", type: "info" });
		expect(notifications.value[0]).toBeDefined();
		expect(notifications.value[0]?.duration).toBe(2000);
		expect(position.value).toBe("bottom-left");
	});
});

describe("useGlobalNotification", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return same instance on multiple calls", () => {
		const instance1 = useGlobalNotification();
		const instance2 = useGlobalNotification();

		expect(instance1).toBe(instance2);
	});

	it("should share state across instances", () => {
		const global1 = useGlobalNotification();
		const global2 = useGlobalNotification();

		global1.show({ title: "Test", message: "Test message", type: "info" });
		expect(global2.notifications.value).toHaveLength(1);
	});
});
