import { spawn } from "child_process";
import fsPath from "path";
import type { YASPP } from "yaspp-types";
import type { IResponse, NotNull } from "../../types";
import { fileUtils } from "../fileUtils";
import type { IYasppNavData } from "../../types/app";




async function validateContent(projectRoot: string, content?: Partial<YASPP.IYasppContentConfig>): Promise<IResponse<YASPP.IYasppContentConfig>> {
	if (!content) {
		return errorResult("no content section in config file");
	}
	if (!content?.root) {
		return errorResult(`Missing configuration option content.root`);
	}
	const contentPath = fsPath.resolve(projectRoot, content.root);
	if (!await fileUtils.isFolder(contentPath)) {
		return errorResult(`Can't find content folder ${content.root} (${contentPath})`);
	}
	if (!content?.index) {
		return errorResult(`Missing configuration option content.index`);
	}
	const indexPath = fsPath.resolve(contentPath, content.index);
	if (!await fileUtils.isFolder(indexPath)) {
		return errorResult(`Can't find content index folder at ${content.index} (${indexPath})`);
	}
	return {
		result: {
			root: content.root,
			index: content.index
		}
	}
}
async function validateStyle(projectRoot: string, style?: Partial<YASPP.IYasppStyleConfig>):
	Promise<IResponse<YASPP.IYasppStyleConfig>> {
	if (!style) {
		return successResult({ root: "" });
	}
	if (!style?.root) {
		return style?.sheets ? errorResult(`Style configuration does not contain a root property.
but has a sheets property`)
			: successResult({ root: "", sheets: [] });
	}
	const stylePath = fsPath.resolve(projectRoot, style.root);
	if (!await fileUtils.isFolder(stylePath)) {
		return errorResult(`Can't find style folder ${style.root} (${stylePath})`);
	}

	const rawSheets = style.sheets;

	const allSheets = typeof rawSheets === "string" ?
		rawSheets.split(',')
		: Array.isArray(rawSheets) ?
			rawSheets.slice()
			: ((rawSheets && console.error(`Invalid sheets entry in configuration ${typeof rawSheets}`)), []);

	const sheets = allSheets.map(s => s.trim()).filter(Boolean);
	for await (const ss of sheets) {
		const sheetPath = fsPath.resolve(stylePath, ss as unknown as string); // work around weird lint error
		if (!await fileUtils.isFile(sheetPath)) {
			return errorResult(`Stylesheet ${ss} not found in ${stylePath}`);
		}
	}
	return successResult({
		root: style.root,
		sheets
	})
}

async function validateNav(projectRoot: string, config?: YASPP.IYasppNavConfig):
	Promise<IResponse<YASPP.IYasppNavConfig>> {
	if (!config?.index) {
		return errorResult(`Missing nav/index in configuration`);
	}
	const navPath = fsPath.resolve(projectRoot, config.index);
	if (!await fileUtils.isFile(navPath)) {
		return errorResult(`Navigation configuration ${config.index} not found at ${navPath}`);
	}
	const navConfig = await fileUtils.readJSON<IYasppNavData>(navPath, { canFail: true });
	if (!navConfig) {
		return errorResult(`Invalid configuration file ${config.index} (${navPath})`);
	}
	const isValid = (key: keyof IYasppNavData) => {
		const data = navConfig[key];
		return Boolean(data && typeof data === "object" && !Array.isArray(data))
	}
	for (const key of ["groups", "sections", "items"] as (keyof IYasppNavData)[]) {
		if (!isValid(key)) {
			return errorResult(`Invalid navigation entry ${key} in navigation config file ${config.index}`);
		}
	}
	return successResult({
		index: config.index
	});


}

async function validateAssets(projectRoot: string, assets?: Partial<YASPP.IYasppAssetsConfig>):
	Promise<IResponse<YASPP.IYasppAssetsConfig>> {
	if (!assets?.root) {
		return successResult({ root: "" });
	}

	const assetPath = fsPath.resolve(projectRoot, assets.root);
	if (!await fileUtils.isFolder(assetPath)) {
		return errorResult(`Can't find assets folder ${assets.root} (${assetPath})`);
	}
	return successResult({
		root: assets.root
	})
}


async function validateLocale(projectRoot: string, locale?: Partial<YASPP.IYasppLocaleConfig>):
	Promise<IResponse<YASPP.IYasppLocaleConfig>> {
	const defaultConfig: YASPP.IYasppLocaleConfig = {
		langs: ["en"],
		defaultLocale: "en",
		pages: {},
		root: ""
	}
	if (!locale) {
		return successResult(defaultConfig);
	}
	if (locale.root) {
		const localePath = fsPath.resolve(projectRoot, locale.root);
		if (!await fileUtils.isFolder(localePath)) {
			return errorResult(`Can't find locale root ${locale.root} (${localePath})`);
		}
	}

	const langs = Array.isArray(locale.langs) ? locale.langs : ["en"];
	const defaultLocale = locale.defaultLocale || "en";
	if (!langs.includes(defaultLocale)) {
		return errorResult(`default locale ${defaultLocale} not found in locales list ${langs}`);
	}
	const pages: Record<string, string[]> = {};
	if (locale.pages) {
		Object.entries(locale.pages).forEach(([key, values]) => {
			if (key && typeof key === "string") {
				if (Array.isArray(values) && values.findIndex(s => !(s && typeof s === "string")) === -1) {
					pages[key] = values;
				}
			}
		})
	}
	return successResult({
		root: locale.root || "",
		langs,
		defaultLocale,
		pages
	});
}

/**
 * Validates on the file system the configuration contained in the provided config
 * @param projectRoot 
 * @param config 
 */
async function validateConfig(projectRoot: string, config?: Partial<YASPP.IYasppConfig>):
	Promise<IResponse<YASPP.IYasppConfig>> {
	const validContent = await validateContent(projectRoot, config?.content),
		validLocale = await validateLocale(projectRoot, config?.locale),
		validStyle = await validateStyle(projectRoot, config?.style),
		validAsssets = await validateAssets(projectRoot, config?.assets),
		validNav = await validateNav(projectRoot, config?.nav);

	const errors = [validContent, validLocale, validStyle, validAsssets].filter(r => r.error).map(r => r.error);

	function toResult<T extends NotNull>(result: IResponse<T>): T {
		return result.result as unknown as T;
	}
	return errors.length ?
		errorResult(errors.join('\n'))
		: {
			result: {
				content: toResult(validContent),
				locale: toResult(validLocale),
				style: toResult(validStyle),
				assets: toResult(validAsssets),
				nav: toResult(validNav)
			}
		}
}

///////////////////////////////////////////////////////////////////////
///////////// Exported members ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

export function runProcess(exe: string, argv: string[], cwd: string): Promise<number> {
	return new Promise<number>(resolve => {
		const proc = spawn(exe, argv, {
			cwd
		})

		proc.on("error", ()  => {
			resolve(-1);
		})

		proc.on('close', function () {
			const code = Number(proc.exitCode);
			resolve(isNaN(code) ? 1 : code);
		});
	})

}


export function errorResult<TResult extends NotNull>(err: string): IResponse<TResult> {
	return {
		result: null,
		error: err
	}
}
export function successResult<TResult extends NotNull>(result: TResult): IResponse<TResult> {
	return {
		result
	}
}

/**
 * Returns the root path of the yaspp site, usually the parent of the yaspp folder but can be anywhere on the
 * local FS. Returns an empty string if the 
 * @param root
 */
export async function getYasppProjectRoot(root?: string): Promise<string> {
	root = root || process.cwd();
	const projectPath = process.env.NEXT_PUBLIC_YASPP_PROJECT_ROOT || process.env.YASPP_PROJECT_ROOT || "..";
	const projectRoot = fsPath.resolve(root, projectPath);
	if (await fileUtils.isFolder(projectRoot)) {
		return projectRoot;
	}
	return "";
}

export async function loadYasppConfig(projectRoot: string): Promise<IResponse<YASPP.IYasppConfig>> {
	try {
		const fname = "yaspp.config.json";
		const configPath = fsPath.resolve(projectRoot, fname);
		const userConfig = await fileUtils.readJSON<YASPP.IYasppConfig>(configPath);
		if (!userConfig) {
			return errorResult(`Missing or invalid yaspp configuration file (${configPath})`);
		}
		return validateConfig(projectRoot, userConfig);
	}
	catch (err) {
		return errorResult(`Error loading yaspp ${err}`);
	}
}