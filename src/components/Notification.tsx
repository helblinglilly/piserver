import React, { useEffect, useState } from "react";

export default function Notification() {
	const { notifications, removeNotification } = useNotification();

	return (
		<>
			{notifications.map((notification, i) => {
				return (
					<div
						key={`${notification}-${i}`}
						className={`notification ${notification.type}`}
						style={notification.message.length > 0 ? {} : { display: "none" }}
					>
						<button
							className="delete"
							onClick={() => {
								removeNotification(notification);
							}}
						></button>
						{notification.message}
					</div>
				);
			})}
		</>
	);
}
