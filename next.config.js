const path = require('path');
const fs = require('fs');
const nextTranslate = require('next-translate-plugin');
const legacyRedirects = require('./legacy.json');
const { withAxiom } = require('next-axiom');

/**
 * Quick sanity test that yaspp.config.json is available in the configured or default location
 * @returns 
 */
async function testConfig() {
	try {
		const projectPath = process.env.NEXT_PUBLIC_YASPP_PROJECT_ROOT || process.env.YASPP_PROJECT_ROOT || "..";
		const configPath = path.resolve(process.cwd(), projectPath, "yaspp.config.json");
		const stat = await fs.promises.lstat(configPath);
		return stat.isFile();
	}
	catch (e) {
		return false;
	}
}

/** @type {import('next').NextConfig} */
const nextConfig = async () => {
	const haveConfig = await testConfig();
	if (!haveConfig) {
		throw new Error(`Failed to find yaspp configuration`);
	}
	const config = {
		reactStrictMode: true,
		optimizeFonts: true,
		sassOptions: {
			includePaths: [path.join(__dirname, 'styles')],
		},
		// publicRuntimeConfig: {
		// 	// basePath: process.env.BASE_PATH || '/public/',
		// },
		// serverRuntimeConfig: {
		// 	// PROJECT_ROOT: __dirname,
		// },
		async redirects() {
			return legacyRedirects;
		},
	}

	return withAxiom(nextTranslate(config));
};

module.exports = nextConfig;
