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

	const sheets: string[] = allSheets.map(s => s.trim()).filter(Boolean);
	for await (const ss of sheets) {
		const sheetPath = fsPath.resolve(stylePath, ss);
		const targetSheet = fileUtils.assertFileExtension(sheetPath, "css");
		if (!await fileUtils.isFile(targetSheet)) {
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
					errors: [err??"", ...errors].filter(Boolean),
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

export function operationResult<TResult extends NotNull>(error?: string, result?: TResult): IResponse<TResult> {
	return error?
		{ error: error, result: null }
		: result ? { result }
			: { result: null, error: `undefined operation result`};
}

/**
 * Returns the root path of the yaspp site, usually the parent of the yaspp folder but can be anywhere on the
 * local FS. Returns an empty string if the 
 * @param projectPath if provided, this is the relative path of the project to process.cwd(), which is
 * assumed to be the yaspp root
 */
export async function getYasppProjectPath(projectPath?: string): Promise<string> {
	const root = process.cwd();
	projectPath = projectPath || process.env.NEXT_PUBLIC_YASPP_PROJECT_ROOT || process.env.YASPP_PROJECT_ROOT || "..";
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
		return errorResult(`Error loading yaspp config ${err}`);
	}
}