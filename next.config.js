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
	experimental: {
		// forceSwcTransforms: true,
	  },
};

module.exports = nextConfig;
