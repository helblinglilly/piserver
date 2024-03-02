import React from "react";
import RootAppCard from "@/components/rootAppCard";

export default function EnergyIndex() {
	return (
		<>
			<div className="columns">
				<div className="column">
					<RootAppCard
						link={{
							url: "energy/bills",
							newTab: false,
						}}
						title={"Bills"}
					/>
				</div>
			</div>

			<div className="columns">
				<div className="column">
					<RootAppCard
						link={{
							url: "energy/usage?mode=hourly",
							newTab: false,
						}}
						title={"Usage"}
					/>
				</div>
			</div>

			<div className="columns">
				<div className="column">
					<RootAppCard
						link={{
							url: "https://octopus.energy/dashboard",
							newTab: false,
						}}
						title={"Octopus Account"}
					/>
				</div>
			</div>
		</>
	);
}
