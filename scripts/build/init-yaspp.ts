/************************************************************/
/** init-yaspp creates the relevant yaspp files, based on   */
/** The configuration stored in the provided project folder */
/************************************************************/

/* eslint-disable no-inner-declarations */

import fsPath from "path";
import { promises as fs } from "fs";
import { errorResult, IResponse, loadYasppConfig, successResult, yasppUtils } from "./utils";
import type { IYasppAppConfig, IYasppLocaleConfig } from "../../src/types/app"
import { fileUtils } from "../../src/lib/fileUtils";
import { I18NConfig } from "../../src/types/locale";

/**
 * The root of the  yaspp module
 */
const ROOT_FOLDER = fsPath.resolve(__dirname, "../..");
const GEN_HEADER = `// ****************************************************************"
// This is a GENERATED file, editing it is likely to break the build
// ****************************************************************\n`;

type NSRecord =  [string, string[]];
interface ILoadNamespacesOptions {
		folder: string;
		locales: ReadonlyArray<string>;
		namespaces: ReadonlyArray<string>;
}

async function loadAllNamespaces({ folder, locales, namespaces}: ILoadNamespacesOptions): Promise<IResponse<NSRecord[]>> {
		if (!await fileUtils.isFolder(folder)) {
			return errorResult(`load namespaces: folder ${folder} not found`);
		}
		const ret: NSRecord[] = [];
		for await (const ns of namespaces) {
			const foundLocales: string[] = [];
			for await (const locale of locales) {
				const nspath = fsPath.resolve(folder, locale, `${ns}.json`);
				if (await fileUtils.isFile(nspath)) {
					foundLocales.push(locale);
				}
			}
			if (foundLocales.length) {
				ret.push([ns, foundLocales]);
			}
		}


		return successResult(ret);
	}


function toNSString(namespaces: NSRecord[]): string {
	const parts = namespaces.map(([ ns, locales ]) => {
		const locs = locales.map(loc => `"${loc}"`);
		return `["${ns}",[${locs.join(',')}]]`
	});
	return parts.join(',');
}
async function generateI18N(projectRoot: string, config: IYasppLocaleConfig): Promise<string> {
	const values = {
		"%LANGS%": [] as ReadonlyArray<string>,
		"%DEFAULT%": "en",
		"%PAGES%": "",
		"%SYSNS%": "",
		"%USERNS%": "",
		"%DICTIONARIES%": ""
	}
	const tmplResult = await yasppUtils.loadTemplate("i18n.js");
	if (tmplResult.error) {
		return tmplResult.error;
	}
	const configResult = await yasppUtils.loadJSONTemplate<I18NConfig>("i18n.json");
	if (configResult.error) {
		return configResult.error;
	}
	const outputTmpl = tmplResult.result!.replace(/\/\/.+$/mg, ""); // template string without comments
	try {
		const localeConfig = configResult.result!
		function ts(s: string) { return `"${s}"`; }
		const sysNS = Object.entries(localeConfig.pages).reduce((ns: Set<string>, [, values]) => {
			values.forEach(s => ns.add(s));
			return ns
		}, new Set<string>());
		const nsArray = Array.from(sysNS.keys());
		const sysLocalePath = fsPath.resolve(__dirname,  `../../locales`);
		const nsResult = await loadAllNamespaces({
			folder: sysLocalePath,
			locales: config.langs,
			namespaces: nsArray
		});
		if (nsResult.error) {
			return nsResult.error;
		}
		values["%SYSNS%"] = toNSString(nsResult.result!);
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
		}, localeConfig.pages);
		values["%PAGES%"] = JSON.stringify(mergedPages, null, 4);
		if (config.root) {
			const userLocalePath = fsPath.resolve(projectRoot, config.root),
				nsPath = fsPath.resolve(userLocalePath, config.defaultLocale);
			if (!await fileUtils.isFolder(nsPath)) {
				return `Failed to find locale folder for ${config.defaultLocale} under ${config.root}`;
			}
			const list = await fs.readdir(nsPath, { withFileTypes: true });
			const JSON_RE = /\.json$/i;
			const userNS = list
				.filter(dirent => dirent.isFile())
				.filter(dirent => JSON_RE.test(dirent.name))
				.map(dirent => dirent.name.replace(JSON_RE, ""));
			const nsResult = await loadAllNamespaces({
				folder: userLocalePath,
				locales: config.langs,
				namespaces: userNS
			});
			if (nsResult.error) {
				return nsResult.error;
			}
			values["%USERNS%"] = toNSString(nsResult.result!);
			const pDict = userNS.reduce((dict: Record<string, string>, ns) => {
				dict[ns] = `./public/yaspp/locales/%LANG%/${ns}.json`;
				return dict;
			}, {})
			dicts.project = pDict
		}
		values["%DICTIONARIES%"] = JSON.stringify(dicts, null, 4);
		const output = Object.entries(values).reduce((html, [key, value]) => {
			const re = new RegExp(key, "g");
			return html.replace(re, String(value));
		}, outputTmpl);
		const outPath = fsPath.resolve(ROOT_FOLDER, "i18n.js");
		await fs.writeFile(outPath, GEN_HEADER + output);
		console.log(`Generated ${yasppUtils.trimPath(outPath)}`);
	}
	catch (err) {
		return `Error Generating i18n.js: ${err}`;
	}
	return "";
}

async function generateAppJSON(config: IYasppAppConfig): Promise<string> {
	const fpath = fsPath.resolve(ROOT_FOLDER, "yaspp.json");
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

async function clean(): Promise<string> {
	try {
		const publicPath = fsPath.resolve(ROOT_FOLDER, "public/yaspp");
		await fileUtils.mkdir(publicPath);
		if (!await fileUtils.isFolder(publicPath)) {
			return "public folder not found";
		}
		const folders = ["content", "locales", "styles", "assets"];
		for await (const folder of folders) {
			const fpath = fsPath.resolve(publicPath, folder);
			await fileUtils.mkdir(fpath);
			await fileUtils.removeFolder({
				path: fpath,
				removeRoot: false
			});
		}
		console.log(`Cleaned ${folders}`);
		return "";
	}
	catch (err) {
		return (`Error cleaning project content ${err}`);
	}
}
/**
 * Returns an error message, empty if no error
 * @param projectRoot The full path of the folder that contains the site's yaspp.config.json file
 */
async function run(projectRoot: string): Promise<string> {
	try {
		const { error, result } = await loadYasppConfig(projectRoot);
		if (error) {
			return error;
		}
		const { nav, content, locale, style } = result!;
		const config: IYasppAppConfig = {
			root: yasppUtils.diffPaths(ROOT_FOLDER, projectRoot),
			content,
			locale,
			style,
			nav
		}
		const appErr = await generateAppJSON(config);
		if (appErr) {
			return appErr;
		}
		const i18err = await generateI18N(projectRoot, locale);
		if (i18err) {
			return i18err;
		}
		const cleanErr = await clean();
		return cleanErr;
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
	exitWith(`Please provide the relative or absolute path of your project, e.g.\n--project ../path/to/your/project`);
}
else {
	const projectRoot = fsPath.resolve(process.cwd(), rootArg);
	run(projectRoot)
		.then(err => {
			exitWith(err);
		})
		.catch(err => {
			exitWith(String(err));
		});
}