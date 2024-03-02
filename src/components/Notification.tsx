import React, { useEffect, useState } from "react";

export default function Notification(props: {
	message: string[];
	type: "success" | "warn" | "fail";
}) {
	const [messages, setMessages] = useState<string[]>([]);
	const [dismissedMessages, setDismissedMessages] = useState<string[]>([]);

	useEffect(() => {
		setMessages(props.message.filter((msg) => !dismissedMessages.includes(msg)));
	}, [props.message, dismissedMessages]);

	let className = "";
	if (props.type === "success") className = "is-success";
	else if (props.type === "warn") className = "is-warning";
	else className = "is-danger";

	const deleteFromMessages = (messageToDelete: string) => {
		setDismissedMessages([...dismissedMessages, messageToDelete]);
	};

	return (
		<>
			{messages.map((msg, i) => {
				return (
					<div
						key={`${msg}-${i}`}
						className={`notification ${className}`}
						style={msg.length > 0 ? {} : { display: "none" }}
					>
						<button
							className="delete"
							onClick={() => {
								deleteFromMessages(msg);
							}}
						></button>
						{msg}
					</div>
				);
			})}
		</>
	);
}
