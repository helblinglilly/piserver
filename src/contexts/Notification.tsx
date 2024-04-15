import React, { createContext, useState, useContext } from "react";

interface Notification {
	message: string;
	type: "success" | "error" | "info";
}

const NotificationContext = createContext<{
	notifications: Notification[];
	addNotification: (notification: Notification) => void;
	removeNotification: (notification: Notification) => void;
	clearNotifications: () => void;
} | undefined>(undefined);

const NotificationProvider = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const removeNotification = (notification: Notification) => {
		setNotifications(notifications.filter((existing) => notification !== existing));
	};

	const addNotification = (notification: Notification) => {
		setNotifications(notifications.concat(notification));
		setTimeout(() => {
			removeNotification(notification);
		}, 1000 * 3);
	};

	const clearNotifications = () => {
		setNotifications([]);
	};

	return (
		<NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearNotifications }}>
			{children}
		</NotificationContext.Provider>
	);
};

function useNotification() {
	const context = useContext(NotificationContext);
	if (context === undefined) {
		throw new Error("useNotification must be used within a NotificationProvider");
	}
	return context;
}

export { NotificationProvider, useNotification };