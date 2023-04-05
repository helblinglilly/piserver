/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "pokemon.helbling.uk",
				port: "",
				pathname: "/static/**",
			},
		],
	},
};

module.exports = nextConfig;
