import { spawn } from "child_process";
import fsPath from "path";
import * as zod from "zod";
import type { YASPP } from "yaspp-types";
import type { IOperationResult, NotNull, OperationPromise } from "types";
import { fileUtils } from "../fileUtils";
import type { IThemeUrl, IYasppNavData } from "types/app";
import YConstants from './constants';
import { stringUtils } from "../stringUtils";
import type { IYasppBindingsFile, IYasppClassOverrides, IYasppClassTree } from "types/styles";

export interface IValidateThemesOptions {
	readonly themes: string | ReadonlyArray<string>;
	readonly styleRoot: string;
	readonly siteRoot: string;
}

export interface IYasppProjectPath {
	readonly root: string;
	readonly project: string;
}

const ClassesSchema = zod.array(zod.string());
const ChangeSchema: zod.ZodType<Partial<IYasppClassOverrides>> = zod.object({
	add: zod.array(zod.string()).optional(),
	remove: zod.array(zod.string()).optional()
})
const ClassRecSchema = zod.union([ClassesSchema, ChangeSchema]);

// const ClassConfigSchema = zod.object({
// 	classes: ClassRecSchema.optional()
// });

const ClassPartSchema = zod.lazy(() => zod.object({
	classes: ClassRecSchema.optional()
}).catchall(ClassPartSchema));

const ClassTreeSchema = zod.record(zod.string(), ClassPartSchema);
type ClassBindings = ReadonlyArray<IYasppClassTree> | IYasppClassTree;


async function validateContent(projectRoot: string, content?: Partial<YASPP.IYasppContentConfig>): Promise<IOperationResult<YASPP.IYasppContentConfig>> {
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
async function validateStyle(projectRoot: string, siteRoot: string, style?: Partial<YASPP.IYasppStyleConfig>):
	Promise<IOperationResult<YASPP.IYasppStyleConfig>> {
	const themes = [];
	if (!style) {
		return successResult({ root: "", themes }); // default themes will be set later
	}
	const classBindings = stringUtils.toStringArray(style.classBindings, { allowEmpty: false, unique: true });
	if (!style?.root) {
		return style?.sheets?.length || style?.themes.length ? errorResult(`Style configuration does not contain a root property.
but has a sheets property`)
			: successResult({ root: "", sheets: [], classBindings, themes });
	}
	const styleRoot = fsPath.resolve(projectRoot, style.root);
	if (!await fileUtils.isFolder(styleRoot)) {
		return errorResult(`Can't find style folder ${style.root} (${styleRoot})`);
	}

	const rawSheets = style.sheets;

	const sheets = stringUtils.toStringArray(rawSheets, { allowEmpty: false, trim: true });

	for await (const ss of sheets) {
		const sheetPath = fsPath.resolve(styleRoot, ss);
		const targetSheet = fileUtils.assertFileExtension(sheetPath, "css");
		if (!await fileUtils.isFile(targetSheet)) {
			return errorResult(`Stylesheet ${ss} not found in ${styleRoot}`);
		}
	}
	themes.push(...(style.themes?.length ? stringUtils.toStringArray(style.themes, {
		allowEmpty: false, unique: true
	}) : ["dark", "light"]));
	const themeRes = await validateThemes({
		themes,
		siteRoot,
		styleRoot
	});
	if (themeRes.error) {
		return errorResult(themeRes.error);
	}
	const themeNames = themeRes.result.map(u => u.name);
	const theme = style.theme || (themeNames.includes("light") ? "light"
		: themeNames.includes("dark") ? "dark" : themeNames[0]);
	if (!themeNames.includes(theme as string)) {
		return errorResult(`Theme field in style configuration contains unknown theme "${theme}"`);
	}
	return successResult({
		root: style.root,
		sheets,
		theme,
		themes: themeNames,
		classBindings
	})
}

async function validateNav(projectRoot: string, config?: YASPP.IYasppNavConfig):
	Promise<IOperationResult<YASPP.IYasppNavConfig>> {
	if (!config?.index) {
		return errorResult(`Missing nav/index in configuration`);
	}
	const navPath = fsPath.resolve(projectRoot, config.index);
	if (!await fileUtils.isFile(navPath)) {
		return errorResult(`Navigation configuration ${config.index} not found at ${navPath}`);
	}
	const { error, result: navConfig } = await fileUtils.readJSON<IYasppNavData>(navPath, { canFail: true });
	if (error) {
		return errorResult(`Invalid configuration file ${config.index} (${navPath}): ${error}`);
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
	Promise<IOperationResult<YASPP.IYasppAssetsConfig>> {
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
	Promise<IOperationResult<YASPP.IYasppLocaleConfig>> {
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
async function validateConfig(projectRoot: string, siteRoot: string, config?: Partial<YASPP.IYasppConfig>):
	Promise<IOperationResult<YASPP.IYasppConfig>> {
	const validContent = await validateContent(projectRoot, config?.content),
		validLocale = await validateLocale(projectRoot, config?.locale),
		validStyle = await validateStyle(projectRoot, siteRoot, config?.style),
		validAsssets = await validateAssets(projectRoot, config?.assets),
		validNav = await validateNav(projectRoot, config?.nav);

	const errors = [validContent, validLocale, validStyle, validAsssets, validNav].filter(r => r.error).map(r => r.error);

	function toResult<T extends NotNull>(result: IOperationResult<T>): T {
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

/**
 * Returns an error message
 * @param themes array of theme names, can also be a comma separated string
 */
export async function validateThemes({ themes, styleRoot, siteRoot }: IValidateThemesOptions): OperationPromise<IThemeUrl[]> {
	const t = stringUtils.toStringArray(themes, { unique: true, allowEmpty: false });
	const errors = [];
	const ret = [] as IThemeUrl[];
	for await (const theme of t) {
		const tname = fileUtils.assertFileExtension(theme, "css"),
			themeName = fileUtils.assertFileExtension(tname, ""),
			stname = themeName + ".scss";
		const sysPath1 = fsPath.resolve(siteRoot, "public/styles/themes", stname),
			sysPath2 = fsPath.resolve(siteRoot, "public/styles/themes", tname);

		if (await fileUtils.isFile(sysPath1) || await fileUtils.isFile(sysPath2)) {
			ret.push({
				path: `/styles/themes/${tname}`,
				name: themeName
			})
		}
		else {
			const uPath1 = fsPath.resolve(styleRoot, "themes", stname),
				uPath2 = fsPath.resolve(styleRoot, "themes", tname);
			if (await fileUtils.isFile(uPath1) || await fileUtils.isFile(uPath2)) {
				ret.push({
					path: `/${YConstants.STYLES_PATH}/themes/${tname}`,
					name: themeName
				})
			}
			else {
				errors.push(`Theme ${themeName} not found`);
			}
		}
	}
	return operationResult(errors.join('\n'), ret);
}

export async function captureProcessOutput(
	{
		cwd = process.cwd(), exe, argv, env, onData, onError, dryrun, quiet, onProgress, shell
	}: YASPP.IProcessOptions): Promise<YASPP.IProcessOutput> {
	const errCB = (onError === true) ?
		(s: string) => !quiet && console.warn(`>${s}`) : onError;

	if (!exe) {
		return {
			output: [], errors: ["No executbale specified"], status: -1
		}
	}
	const dataCB = (onData === true) ?
		(s: string) => !quiet && console.log(`>${s}`) : onData;

	const progress = typeof onProgress === "function" ? {
		callback: onProgress as () => unknown,
		cleanup: () => void 0,
		interval: null as NodeJS.Timeout | null
	} :
		onProgress === true ? {
			callback: () => process.stdout.write('.'),
			cleanup: () => console.log('done'),
			interval: null as NodeJS.Timeout | null
		}
			: null;

	if (!quiet) {
		console.log(`running ${exe} ${argv.join(' ')} in ${trimPath(String(cwd))}`);
	}
	if (dryrun) {
		return {
			status: 0,
			errors: [],
			output: []
		}
	}
	return new Promise<YASPP.IProcessOutput>((resolve) => {
		const output: string[] = [];
		const errors: string[] = [];
		let resolved = false;
		function resolveWith(status: number | null, err?: string): void {
			if (!resolved) {
				resolved = true;
				resolve({
					status: Number(status),
					errors: [err ?? "", ...errors].filter(Boolean),
					output
				});
			}
		}
		try {
			const processEnv = env ? {
				...process.env, ...env
			} : undefined;
			const sexe: string = exe,
				sargv: string[] = argv; //weird lint error that conflicts with the build if fixed locally
			const proc = spawn(sexe, sargv, {
				shell: shell !== false,
				cwd,
				env: processEnv
			});
			if (progress?.callback) {
				progress.interval = setInterval(progress.callback, 100);
			}
			proc.on("error", err => {
				resolveWith(2, String(err));
			})
			proc.stderr.on('data', data => {
				errors.push(String(data));
				errCB && errCB(String(data));

			});
			proc.stdout.on('data', data => {
				output.push(String(data));
				dataCB && dataCB(String(data));
			});

			proc.on('close', function () {
				resolveWith(proc.exitCode);
			});
		}
		catch (e) {
			resolveWith(3, String(e))
		}
	})
		.catch(err => ({
			status: 1,
			output: [],
			errors: [String(err)]
		}))
		.finally(() => {
			if (progress) {
				if (progress.interval) {
					clearInterval(progress.interval);
					progress.interval = null;
				}
				progress.cleanup();
			}
		})
}

/**
* Returns a reasonably sized path of the path for display, e.g. users/docs/readme.md
* @param path 
*/
export function trimPath(path: string): string {
	const parts = path.split(/[/\\]+/);
	return parts.slice(Math.max(0, parts.length - 3)).join('/');
}


export function errorResult<TResult extends NotNull>(err: string): IOperationResult<TResult> {
	return {
		result: null,
		error: err
	}
}
export function successResult<TResult extends NotNull>(result: TResult): IOperationResult<TResult> {
	return {
		result
	}
}

export function operationResult<TResult extends NotNull>(error?: string, result?: TResult): IOperationResult<TResult> {
	return error ?
		{ error: error, result: null }
		: result ? { result }
			: { result: null, error: `undefined operation result` };
}

/**
 * Returns the root path of the yaspp site, usually the parent of the yaspp folder but can be anywhere on the
 * local FS. Returns an empty string if the folder is not found
 * @param projectPath if provided, this is the relative path of the project to process.cwd(), which is
 * assumed to be the yaspp root
 */
export async function getYasppProjectPath(projectPath?: string): Promise<IYasppProjectPath> {
	const root = process.cwd();
	projectPath = projectPath || process.env.NEXT_PUBLIC_YASPP_PROJECT_ROOT || process.env.YASPP_PROJECT_ROOT || "..";
	const projectRoot = fsPath.resolve(root, projectPath);
	if (await fileUtils.isFolder(projectRoot)) {
		return { root, project: projectRoot };
	}
	return { root, project: "" };
}

export async function loadYasppConfig(projectRoot: string, siteRoot: string): Promise<IOperationResult<YASPP.IYasppConfig>> {
	try {
		const configPath = fsPath.resolve(projectRoot, YConstants.CONFIG_FILE);
		const { result: userConfig, error } = await fileUtils.readJSON<YASPP.IYasppConfig>(configPath);
		if (!userConfig) {
			return errorResult(`Missing or invalid yaspp configuration file (${configPath}): ${error || "unknown error"}`);
		}
		return validateConfig(projectRoot, siteRoot, userConfig);
	}
	catch (err) {
		return errorResult(`Error loading yaspp config ${err}`);
	}
}

export function validateClassBindings(bindings: ClassBindings): IOperationResult<IYasppClassTree[]> {
	const ret = [];
	const b: IYasppClassTree[] = Array.isArray(bindings) ? bindings : [bindings];
	const errors: string[] = [];
	for (const bindings of b) {
		const res = ClassTreeSchema.safeParse(bindings);
		if (!res.success) {
			errors.push(`Binding validation error(${res.error?.message || "unknown"}`)
		}
		else if (res.data) {
			ret.push(res.data);
		}
	}

	return errors.length ? {
		error: errors.join('\n')
	} : { result: ret };
}


export async function loadClassBindings(path: string): OperationPromise<IYasppClassTree[]> {
	const errors = [] as string[];
	const allBindings: IYasppClassTree[] = [];
	const jres = await fileUtils.readJSON<IYasppBindingsFile>(path);
	if (!jres.result) {
		errors.push(`Failed to find bindings file ${path}: ${jres.error || "uknown error"}`);
	}
	else {
		const bres = validateClassBindings(jres.result.bindings);
		if (bres.error) {
			errors.push(`Error parsing ${path}: ${bres.error}`);
		}
		else {
			allBindings.push(...bres.result);
		}
	}
	return operationResult(errors.join('\n'), allBindings)

}
