import fsPath from "path";
import { promises as fs } from "fs";
import { parse as parseJSON } from "json5";
import { loadYaspConfig, yasppUtils } from "./utils";
import type { I18NConfig, IYasppAppConfig, IYasppLocaleConfig } from "../../src/types/app";
import { fileUtils } from "../../src/lib/fileUtils";

const rootPath = fsPath.resolve(__dirname, "../..");
const I18N_TMPL = "i18n-tmpl.json";
const GEN_HEADER = `// ****************************************************************"
// This is a GENERATED file, editing it is likely to break the build
// ****************************************************************\n`;

/**
 * Both paths point to folders
 * @param fromPath
 * @param toPath 
 */
function diffPaths(fromPath: string, toPath: string): string {
	const fromParts = fromPath.split(/[\/\\]+/),
		toParts = toPath.split(/[\/\\]+/);
	let rest = "";
	const retParts = [] as string[];
	for (let ind = 0, len = fromParts.length, toLen = toParts.length; ind < len; ++ind) {
		if (rest || ind >= toLen) {
			retParts.push("..");
		}
		else if (fromParts[ind] !== toParts[ind]) {
			rest = toParts.slice(Math.min(ind, toParts.length - 1)).join('/');
			retParts.push("..");
		}
	}
	if (rest) {
		retParts.push(rest);
	}
	return retParts.join('/')

}

async function generateI18N(projectRoot: string, config: IYasppLocaleConfig): Promise<string> {
	const values = {
		"%LANGS%": [] as ReadonlyArray<string>,
		"%DEFAULT%": "en",
		"%PAGES%": "",
		"%SYSNS%": [] as ReadonlyArray<string>,
		"%USERNS%": [] as ReadonlyArray<string>
	}
	const outputTmpl = `
module.exports = {
	locales: [%LANGS%],
	defaultLocale: "%DEFAULT%",
	logBuild: false,
	pages: 	%PAGES%,
	loadLocaleFrom: (function(sysNS, userNS) {
		const uns = new Set(userNS);
		const sns = new Set(sysNS);
		async function load(path) {
			try {
				const m = await import(path);
				return m.default;

			} catch (err) {
				console.log(\`Failed to load locale from \${path}\`);
				return {};
			}
		}
		return (async (lang, ns) => {
				// You can use a dynamic import, fetch, whatever. You should
				// return a Promise with the JSON file.
				const ret = {};
				if (sns.has(ns)) {
					const m = await load(\`./locales/\${lang}/\${ns}.json\`);
					Object.assign(ret, m.default);
				}
				if (uns.has(ns)) {
					const m = await load(\`./public/locales/\${lang}/\${ns}.json\`);
					Object.assign(ret, m.default);
				}

				return  ret;
		});
	})(
		[%SYSNS%],
		[%USERNS%]
	)
}`;
	const tmplPath = fsPath.resolve(process.cwd(), I18N_TMPL);
	if (!await fileUtils.isFile(tmplPath)) {
		return `Template file ${I18N_TMPL} (${tmplPath}) not found`;
	}
	try {
		function ts(s: string) { return `"${s}"`; }
		const data = await fs.readFile(tmplPath, "utf-8");
		const tmpl = parseJSON<I18NConfig>(data);
		const sysNS = Object.entries(tmpl.pages).reduce((arr: Set<string>, [key, values]) => {
			values.forEach(s => arr.add(s));
			return arr
		}, new Set<string>());
		values["%SYSNS%"] = Array.from(sysNS.keys()).map(ts);
		values["%DEFAULT%"] = config.defaultLocale;
		values["%LANGS%"] = config.langs.map(ts);
		const mergedPages = Object.entries(config.pages).reduce((pages, [key, values]) => {
			pages[key] = values;
			return pages;
		}, tmpl.pages);
		values["%PAGES%"] = JSON.stringify(mergedPages, null, 4);
		if (config.root) {
			const nsPath = fsPath.resolve(projectRoot, config.root, config.defaultLocale);
			if (!await fileUtils.isFolder(nsPath)) {
				return `Failed to find locale folder for ${config.defaultLocale} under ${config.root}`;
			}
			const list = await fs.readdir(nsPath, { withFileTypes: true });
			values["%USERNS%"] = list
				.filter(dirent => dirent.isFile())
				.filter(dirent => /\.json$/.test(dirent.name))
				.map(dirent => dirent.name)
				.map(s => s.replace(/\.[^\.]+$/, ""))
				.map(ts)
		}
		const output = Object.entries(values).reduce((html, [key, value]) => {
			const re = new RegExp(key, "g");
			return html.replace(re, String(value));
		}, outputTmpl);
		const outPath = fsPath.resolve(process.cwd(), "i18n-test.js");
		await fs.writeFile(outPath, GEN_HEADER + output);
	}
	catch (err) {
		return `Error loading template file ${I18N_TMPL} (${tmplPath}): ${err}`;
	}
	return "";
}

async function generateAppJSON(config: IYasppAppConfig): Promise<string> {
	const fpath = fsPath.resolve(rootPath, "yaspp.json");
	try {
		const data = [
			GEN_HEADER,
			JSON.stringify(config, null, 4)
		]
		await fs.writeFile(fpath, data.join('\n'));
		return "";
	}
	catch (err) {
		return `Error generating yaspp.json (${fpath}): ${err}`;
	}

}
/**
 * Returns an error message, empty if no error
 */
async function run(projectRoot: string): Promise<string> {
	try {
		const { error, result } = await loadYaspConfig(projectRoot,{ validate: true });
		if (error) {
			return error;
		}
		const { content, locale } = result!;
		const config: IYasppAppConfig = {
			root: diffPaths(rootPath, projectRoot),
			content,
			locale
		}
		const appErr = await generateAppJSON(config);
		if (appErr) {
			return appErr;
		}
		const i18err = await generateI18N(projectRoot, locale);
		if (i18err) {
			return i18err;
		}
		return "";
	}
	catch (e) {
		return `Error loading yaspp.json: ${e}`;
	}
}

function exitWith(err: string): void {
	if (err) {
		console.error(err);
	}
	process.exit(err ? 1 : 0);
}

const rootArg = yasppUtils.getArg(process.argv, "--project") || yasppUtils.getArg(process.argv, "-P");
if (!rootArg) {
	exitWith(`Please provide a single argument - the relative or absolute path of your project`);
}
else {
	const projectRoot = fsPath.resolve(process.cwd(), rootArg!);
	run(projectRoot)
		.then(err => {
			exitWith(err);
		})
		.catch(err => {
			exitWith(String(err));
		});
}