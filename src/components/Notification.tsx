export default function Notification(props: {
	message: string[];
	type: "success" | "warn" | "fail";
}) {
	let className = "";
	if (props.type === "success") className = "is-success";
	else if (props.type === "warn") className = "is-warning";
	else if (props.type === "fail") className = "is-danger";
	return (
		<>
			{props.message.map((msg, i) => {
				return (
					<div
						key={`${msg}-${i}`}
						className={`notification ${className}`}
						style={msg.length > 0 ? {} : { display: "none" }}
					>
						{msg}
					</div>
				);
			})}
		</>
	);
}
