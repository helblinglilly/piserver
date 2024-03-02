import React from "react";
import RootAppCard from "@/components/rootAppCard";

export default function Home() {
	return (
		<main>
			<div className="columns">
				<div className="column">
					<RootAppCard
						link={{ url: "/timesheet", newTab: false }}
						image={{ url: "/clock.png", altText: "Clock" }}
						title={"Timesheet"}
					/>
				</div>

				<div className="column">
					<RootAppCard
						link={{
							url: "/energy",
							newTab: false,
						}}
						image={{ url: "/energy.png", altText: "Energy" }}
						title={"Energy"}
					/>
				</div>
			</div>
			<div className="columns">
				<div className="column">
					<RootAppCard
						link={{ url: "http://192.168.0.10:81/admin", newTab: false }}
						image={{ url: "/pihole.svg", altText: "Pi Hole Icon" }}
						title={"Pi Hole"}
					/>
				</div>

				<div className="column">
					<RootAppCard
						link={{
							url: "http://192.168.0.11:5000/files/login?redirect=%2Ffiles%2F",
							newTab: false,
						}}
						image={{ url: "/files.png", altText: "File Icon" }}
						title={"Files"}
					/>
				</div>
			</div>

			<div className="columns">
				<div className="column">
					<RootAppCard
						link={{
							url: "http://192.168.0.11:8096",
							newTab: false,
						}}
						image={{ url: "/jellyfin.png", altText: "Jellyfin Icon" }}
						title={"Jellyfin"}
					/>
				</div>
				<div className="column">
					<RootAppCard
						link={{
							url: "https://192.168.0.10:1234",
							newTab: false,
						}}
						image={{ url: "/docker.png", altText: "Docker Icon" }}
						title={"Portainer"}
					/>
				</div>
			</div>

			<div className="columns">
				<div className="column">
					<RootAppCard
						link={{ url: "http://blackberry.local:8080/", newTab: true }}
						image={{ url: "/qbittorrent.png", altText: "qBittorent Icon" }}
						title={"qBittorrent"}
					/>
				</div>
				<div className="column" />
			</div>
		</main>
	);
}
