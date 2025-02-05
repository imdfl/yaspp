import fsPath from "path";
import { promises as fs } from "fs";
import { parse as parseJSON } from "json5";
import { loadYasppConfig, yasppUtils } from "./utils";
import type { IProjectLocaleConfig, IYasppAppConfig, IYasppLocaleConfig } from "../../src/types/app";
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
		"%USERNS%": [] as ReadonlyArray<string>,
		"%DICTIONARIES%": ""
	}
	const outputTmpl = `
const uns = new Set([%USERNS%]);
const sns = new Set([%SYSNS%]);
module.exports = {
	locales: [%LANGS%],
	defaultLocale: "%DEFAULT%",
	logBuild: false,
	pages: 	%PAGES%,
	dictionaries: %DICTIONARIES%,
	loadLocaleFrom: async (lang, ns) => {
		console.log(\`load ns \${ns} for locale \${lang}\`)
		// You can use a dynamic import, fetch, whatever. You should
		// return a Promise with the JSON file.
		const ret = {};
		if (sns.has(ns)) {
			const m = await import(\`./locales/\${lang}/\${ns}.json\`);
			Object.assign(ret, m.default);
		}
		if (uns.has(ns)) {
			const m = await import(\`./public/locales/\${lang}/\${ns}.json\`);
			Object.assign(ret, m.default);
		}

		return ret;
	}
}`;
	const tmplPath = fsPath.resolve(process.cwd(), I18N_TMPL);
	if (!await fileUtils.isFile(tmplPath)) {
		return `Template file ${I18N_TMPL} (${tmplPath}) not found`;
	}
	try {
		function ts(s: string) { return `"${s}"`; }
		const data = await fs.readFile(tmplPath, "utf-8");
		const tmpl = parseJSON<IProjectLocaleConfig>(data);
		const sysNS = Object.entries(tmpl.pages).reduce((ns: Set<string>, [key, values]) => {
			values.forEach(s => ns.add(s));
			return ns
		}, new Set<string>());
		const nsArray = Array.from(sysNS.keys());
		values["%SYSNS%"] = nsArray.map(ts);
		const sysDict = nsArray.reduce((dict: Record<string, string>, ns) => {
			dict[ns] = `./locales/%LANG%/${ns}.json`;
			return dict;
		}, {})
		const dicts = {
			system: sysDict,
			project: {} as Record<string, string>
		}
		values["%DEFAULT%"] = config.defaultLocale;
		values["%LANGS%"] = config.langs.map(ts);
		const mergedPages = Object.entries(config.pages).reduce((pages, [key, values]) => {
			const sys = new Set(pages[key] || []);
			values.forEach(s => sys.add(s));
			pages[key] = Array.from(sys.keys());
			return pages;
		}, tmpl.pages);
		values["%PAGES%"] = JSON.stringify(mergedPages, null, 4);
		if (config.root) {
			const nsPath = fsPath.resolve(projectRoot, config.root, config.defaultLocale);
			if (!await fileUtils.isFolder(nsPath)) {
				return `Failed to find locale folder for ${config.defaultLocale} under ${config.root}`;
			}
			const list = await fs.readdir(nsPath, { withFileTypes: true });
			const userNS = list
			.filter(dirent => dirent.isFile())
			.filter(dirent => /\.json$/.test(dirent.name))
			.map(dirent => dirent.name)
			.map(s => s.replace(/\.[^\.]+$/, ""));
			values["%USERNS%"] = userNS.map(ts);
			const pDict = nsArray.reduce((dict: Record<string, string>, ns) => {
				dict[ns] = `./public/locales/%LANG%/${ns}.json`;
				return dict;
			}, {})
				dicts.project = pDict
		}
		values["%DICTIONARIES%"] = JSON.stringify(dicts, null, 4);
		const output = Object.entries(values).reduce((html, [key, value]) => {
			const re = new RegExp(key, "g");
			return html.replace(re, String(value));
		}, outputTmpl);
		const outPath = fsPath.resolve(process.cwd(), "i18n.js");
		await fs.writeFile(outPath, GEN_HEADER + output);
		console.log(`Generated ${yasppUtils.trimPath(outPath)}`);
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
		console.log(`Generated ${yasppUtils.trimPath(fpath)}`);
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
		const { error, result } = await loadYasppConfig(projectRoot,{ validate: true });
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
	exitWith(`Please provide the relative or absolute path of your project, e.g.\n--project ../../mysite\nOR\n--project /users/me/projects/mysite`);
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