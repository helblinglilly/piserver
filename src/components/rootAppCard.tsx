import Image from "next/image";
import Link from "next/link";

export default function RootAppCard(props: {
	link: { url: string; newTab: boolean };
	image?: { url: string; altText: string };
	title: string;
}) {
	return (
		<Link
			href={`${props.link.url}`}
			target={`${props.link.newTab ? "_blank" : "_self"}`}
		>
			<div className="card">
				<div className="card-content">
					{props.image ? (
						<figure className="container card-icon-text" style={{ display: "flex" }}>
							<Image
								className="icon mr-1"
								src={`${props.image.url}`}
								height={32}
								width={32}
								alt={`${props.image.altText}`}
							/>
							<p className="card-text">{`${props.title}`}</p>
						</figure>
					) : (
						<p className="card-text">{`${props.title}`}</p>
					)}
				</div>
			</div>
		</Link>
	);
}
