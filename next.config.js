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
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	  },
};

module.exports = nextConfig;
