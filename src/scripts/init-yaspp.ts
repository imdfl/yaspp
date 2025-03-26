/************************************************************/
/** init-yaspp creates the relevant yaspp files, based on   */
/** The configuration stored in the provided project folder */
/************************************************************/

/* eslint-disable no-inner-declarations */

import fsPath from "path";
import { promises as fs } from "fs";
import { yasppUtils } from "./utils";
import { fileUtils } from "@lib/fileUtils";
import type { I18NConfig } from "types/locale";
import type { YASPP } from "yaspp-types";
import type { IResponse } from "types";
import { errorResult, getYasppProjectPath, loadYasppConfig, successResult, trimPath } from "@lib/yaspp/yaspp-lib";
import YConstants from "../lib/yaspp/constants";

/**
 * The root of the  yaspp module
 */
const ROOT_FOLDER = fsPath.resolve(__dirname, "../..");
/**
 * The projects various resources are linked here
 */

const GEN_HEADER = `// ****************************************************************"
// This is a GENERATED file, editing it is likely to break the build
// ****************************************************************\n`;

type NSRecord = [string, string[]];
interface ILoadNamespacesOptions {
	folder: string;
	locales: ReadonlyArray<string>;
	namespaces: ReadonlyArray<string>;
}

async function loadAllNamespaces({ folder, locales, namespaces }: ILoadNamespacesOptions): Promise<IResponse<NSRecord[]>> {
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
	const parts = namespaces.map(([ns, locales]) => {
		const locs = locales.map(loc => `"${loc}"`);
		return `["${ns}",[${locs.join(',')}]]`
	});
	return parts.join(',');
}
async function generateI18N(projectRoot: string, config: YASPP.IYasppLocaleConfig): Promise<string> {
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
	const outputTmpl = tmplResult.result.replace(/\/\/.+$/mg, ""); // template string without comments
	try {
		const localeConfig = configResult.result;
		function ts(s: string) { return `"${s}"`; }
		const sysNS = Object.entries(localeConfig.pages).reduce((ns: Set<string>, [, values]) => {
			values.forEach(s => ns.add(s));
			return ns
		}, new Set<string>());
		const nsArray = Array.from(sysNS.keys());
		const sysLocalePath = fsPath.resolve(__dirname, `../../locales`);
		const nsResult = await loadAllNamespaces({
			folder: sysLocalePath,
			locales: config.langs,
			namespaces: nsArray
		});
		if (nsResult.error) {
			return nsResult.error;
		}
		values["%SYSNS%"] = toNSString(nsResult.result);
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
			values["%USERNS%"] = toNSString(nsResult.result);
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
		console.log(`Generated ${trimPath(outPath)}`);
	}
	catch (err) {
		return `Error Generating i18n.js: ${err}`;
	}
	return "";
}

/**
 * @param projectRoot
 * @param config known to be valid
 * @returns 
 */
async function createSiteRoot(/*projectRoot: string, config: YASPP.IYasppConfig */): Promise<string> {
	try {
		const publicPath = fsPath.resolve(ROOT_FOLDER, YConstants.PUBLIC_PATH);
		const perr = await fileUtils.mkdir(publicPath);
		return perr ?
			`Can't find or create ${YConstants.PUBLIC_PATH}: ${perr}`
			: "";
	}
	catch (err) {
		return (`Error creating public root at ${YConstants.PUBLIC_PATH} under ${ROOT_FOLDER}: ${err}`);
	}
}

async function generateLocalConfig(config: YASPP.IYasppConfig): Promise<string> {
	const { locale, style, assets, content, nav } = config;
	function toPath(relPath: string): string {
		return relPath; //`${YConstants.PUBLIC_PATH}/${relPath}`;
	}
	const localConfig: YASPP.IYasppConfig = {
		content: {
			...content,
			root: toPath("content"),
		},
		nav: {
			...nav,
			index: toPath("nav.json")
		},
		locale: locale ? {
			...locale,
			root: toPath("locales"),
		} : undefined,
		style: style ? {
			...style,
			root: toPath("styles"),
		} : undefined,
		assets: assets ? {
			...assets,
			root: toPath("assets"),
		} : undefined
	};
	const outPath = fsPath.resolve(ROOT_FOLDER, YConstants.PUBLIC_PATH, YConstants.CONFIG_FILE);
	try {
		await fs.writeFile(outPath, JSON.stringify(localConfig, null, '\t'));
		return "";
	}
	catch (err) {
		return `Error writing ${YConstants.CONFIG_FILE}: ${err}`;
	}
}
/**
 * Returns an error message, empty if no error
 * @param projectRoot The full path of the folder that contains the site's yaspp.config.json file
 */
async function run(projectRoot: string): Promise<string> {
	try {
		const projectPath = await getYasppProjectPath(projectRoot);
		if (!projectPath) {
			return `project folder not found at ${projectRoot}`;
		}
		const { error, result } = await loadYasppConfig(projectPath);
		if (error) {
			return error;
		}
		const config = result,
			{ locale } = config;

		const cleanErr = await createSiteRoot(/*projectRoot, config */);
		if (cleanErr) {
			return cleanErr;
		}
		const i18err = await generateI18N(projectPath, locale);
		if (i18err) {
			return i18err;
		}

		const configErr = await generateLocalConfig(config);
		return configErr;
	}
	catch (e) {
		return `Error loading yaspp.json: ${e}`;
	}
}

const rootArg = yasppUtils.getArg(process.argv, "--project");
if (!rootArg) {
	yasppUtils.exitWith(`Please provide the relative or absolute path of your project, e.g.\n--project ../path/to/your/project`);
}
else {
	run(rootArg)
		.then(err => {
			yasppUtils.exitWith(err);
		})
		.catch(err => {
			yasppUtils.exitWith(String(err));
		});
}