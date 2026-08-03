const path = require('path');
const fs = require('fs');
const nextTranslate = require('next-translate-plugin');
const legacyRedirects = require('./legacy.json');
const { withAxiom } = require('next-axiom');

/**
 * Quick sanity test that yaspp.config.json is available in the configured or default location
 * @returns 
 */
async function loadConfig() {
	try {
		const projectPath = 
		// process.env.NEXT_PUBLIC_YASPP_PROJECT_ROOT 
		// || process.env.YASPP_PROJECT_ROOT 
		// || 
		"public/yaspp";
		const configPath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), projectPath, "yaspp.config.json");
		const txt = await fs.promises.readFile(configPath);
		return JSON.parse(txt);
	}
	catch (e) {
		return null;
	}
}

/** @type {import('next').NextConfig} */
const nextConfig = async () => {
	const yasppConfig = await loadConfig();
	if (!yasppConfig) {
		throw new Error(`Failed to find yaspp configuration`);
	}
	const locale = yasppConfig.locale || {};
	const config = {
		reactStrictMode: true,
		i18n: {
			defaultLocale: locale.initialLocale || undefined,
			localeDetection: !locale.initialLocale,
			locales: Array.isArray(locale.locales) ? locale.locales : []
		},
		// optimizeFonts: true,
		sassOptions: {
			includePaths: [/*turbopackIgnore: true*/ path.join(__dirname, 'public/styles')],
			"silenceDeprecations": ["if-function"]
		},
		async redirects() {
			return legacyRedirects;
		}
	}
	return withAxiom(nextTranslate(config, { turbopack: true }));
};

module.exports = nextConfig;
