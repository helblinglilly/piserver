import DailyRundownChart from "@/components/Energy/DailyRundownChart";
import HourlyRundownChart from "@/components/Energy/HourlyRundownChart";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EnergyIndex() {
	const router = useRouter();
	const [mode, setMode] = useState<"hourly" | "daily" | undefined>();

	useEffect(() => {
		if (router.query.mode !== undefined) {
			setMode(router.query.mode === "daily" ? "daily" : "hourly");
		}
	}, [mode, router.query.mode]);

	const switchMode = (targetMode: string) => {
		const path = router.asPath;
		const removeQueryParam = (url: string, param: string) => {
			const regex = new RegExp(
				`([?&])${param}=.*?(&|$)|^${param}=.*?(&|$)`,
				"i"
			);
			const updatedUrl = url.replace(regex, (match, p1, p2) => {
				if (p2) {
					return p2;
				} else if (p1) {
					return p1;
				} else {
					return "";
				}
			});
			if (updatedUrl.endsWith("?") || updatedUrl.endsWith("&")) {
				return updatedUrl.slice(0, -1);
			} else {
				return updatedUrl;
			}
		};

		if (!path.includes("mode")) {
			router.replace(
				`${path}${path.includes("?") ? "&" : "?"}mode=${targetMode}`
			);
		} else {
			const cleanedPath = removeQueryParam(path, "mode");
			router.replace(
				`${cleanedPath}${
					cleanedPath.includes("?") ? "&" : "?"
				}mode=${targetMode}`
			);
		}
	};

	return (
		<>
			<div className="box">
				<div className="tabs is-fullwidth">
					<ul>
						<li
							onClick={() => {
								setMode("hourly");
								switchMode("hourly");
							}}
							className={mode === "hourly" ? "is-active" : ""}
						>
							<a>Hourly</a>
						</li>
						<li
							onClick={() => {
								setMode("daily");
								switchMode("daily");
							}}
							className={mode === "daily" ? "is-active" : ""}
						>
							<a>Daily</a>
						</li>
					</ul>
					<div></div>
				</div>
				{mode === "hourly" ? <HourlyRundownChart /> : <></>}
				{mode === "daily" ? <DailyRundownChart /> : <></>}
			</div>
		</>
	);
}
