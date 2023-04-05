import "@/styles/globals.css";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	// eslint-disable-next-line no-unused-vars
	getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
	// Use the layout defined at the page level, if available
	const getLayout = Component.getLayout ?? ((page) => page);

	// Generate the links and names for breadcrumbs
	const router = useRouter();
	const routes = router.asPath.split("/");

	let pages: { link: string; name: string }[] = [];

	if (router.asPath !== "/") {
		pages = routes.map((route, i, arr) => {
			return {
				link: !route
					? "/"
					: arr.filter((a) => routes.indexOf(a) <= i).join("/"),
				name:
					route.length > 0 ? route[0].toUpperCase() + route.slice(1) : "Home",
			};
		});
	}

	return getLayout(
		<>
			<nav className="navbar" role={"navigation"} id="navbar">
				<div className="navbar-brand" style={{ display: "inline-flex" }}>
					<a className="navbar-item">
						<Image
							src={"/pi.svg"}
							height={32}
							width={32}
							alt={"Raspberry Pi Logo"}
						/>
					</a>
				</div>
				<Link
					className="navbar-item"
					href="/"
					style={{ display: "inline-flex" }}
				>
					Look Mum No WiFi
				</Link>
			</nav>

			<div className="container is-max-desktop p-6">
				<nav className="breadcrumb" aria-label="breadcrumbs">
					<ul>
						{pages.map((page, i) => (
							<li
								className={i === pages.length - 1 ? "is-active" : ""}
								key={`breadcrumb-${i}`}
							>
								<Link href={page.link}>{page.name.split("?")[0]}</Link>
							</li>
						))}
					</ul>
				</nav>
				<Component {...pageProps} />
			</div>
		</>
	);
}
