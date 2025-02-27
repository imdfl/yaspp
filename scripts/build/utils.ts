/* eslint-disable no-inner-declarations */

import { promises as fs } from "fs";
import fsPath from "path";
import { spawn } from "child_process";
import { parse as parseJSON } from "json5";

import type { IYasppContentConfig, IYasppConfig, IYasppLocaleConfig, 
	IYasppStyleConfig, IYasppAssetsConfig, IYasppAppConfig,
	IYasppNavConfig,
	IYasppNavData
} from "../../src/types/app";
import { fileUtils } from '../../src/lib/fileUtils';

const ROOT_PATH = fsPath.resolve(__dirname, "../..");
const WIN_DEVICE_RE = /^([A-Z]):[\\\/]+/i; // eslint-disable-line no-useless-escape

export interface IResponse<T> {
	result: T | null;
	error?: string;
}

export interface IYasppUtils {
	/**
	 * Given an argv style argument array, tries to find the param following the given key, so
	 * 
	 * `init-yaspp --project ../mels-loop`
	 * @param args 
	 * @param key 
	 */
	getArg(args: string[], key: string): string | null;

	runProcess(exe: string, argv: string[], cwd: string): Promise<number>;
	/**
	 * Returns a reasonably sized path of the path for display, e.g. users/docs/readme.md
	 * @param path 
	 */
	trimPath(path: string): string;
	/**
	 * Returns an error message if any
	 * @param srcPath 
	 * @param targetPath 
	 * @param clean if true, delete target content before copying
	 */
	copyFolderContent(srcPath: string, targetPath: string, clean: boolean): Promise<string>;
	/**
	 * Validates on the file system the configuration contained in the provided config
	 * @param projectRoot 
	 * @param config 
	 */
	validateConfig(projectRoot: string, config?: Partial<IYasppConfig>): Promise<IResponse<IYasppConfig>>;
	/**
	 * Returns the relative path from `fromPath` to  `toPath`, e.g. ../../docs/content
	 * @param fromPath 
	 * @param toPath 
	 */
	diffPaths(fromPath: string, toPath: string): string;

	/**
	 * Returns the text content of `../templates/${name}.tmpl`
	 * @param name 
	 */
	loadTemplate(name: string): Promise<IResponse<string>>;

	normalizePath(path: string): string;
}

export interface IYasppLoadOptions {
	readonly validate: boolean;
}

export function errorResult<TResult = IYasppConfig>(err: string): IResponse<TResult> {
	return {
		result: null,
		error: err
	}
}
export function successResult<TResult = IYasppConfig>(result: TResult): IResponse<TResult> {
	return {
		result
	}
}

async function validateContent(projectRoot: string, content?: Partial<IYasppContentConfig>): Promise<IResponse<IYasppContentConfig>> {
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
async function validateStyle(projectRoot: string, style?: Partial<IYasppStyleConfig>): Promise<IResponse<IYasppStyleConfig | undefined>> {
	if (!style) {
		return successResult(undefined);
	}
	if (!style?.root) {
		return errorResult(`Style configuration does not contain a root property.
If you have no style configuration, remove the style block from the configuration`);
	}
	const stylePath = fsPath.resolve(projectRoot, style.root);
	if (!await fileUtils.isFolder(stylePath)) {
		return errorResult(`Can't find style folder ${style.root} (${stylePath})`);
	}
	if (style.index) {
		const indexPath = fsPath.resolve(stylePath, style.index);
		if (!await fileUtils.isFile(indexPath)) {
			return errorResult(`Can't find style index at ${style.index} (${indexPath})`);
		}
	}
	return successResult({
		root: style.root,
		index: style.index
	})
}

async function validateNav(projectRoot: string, config?: IYasppNavConfig): Promise<IResponse<IYasppNavConfig | undefined>> {
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
	function isValid(key: keyof IYasppNavData) {
		const data = navConfig![key];
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

async function validateAssets(projectRoot: string, assets?: Partial<IYasppAssetsConfig>): Promise<IResponse<IYasppAssetsConfig | undefined>> {
	if (!assets) {
		return successResult(undefined);
	}
	if (!assets?.root) {
		return errorResult(`Assets configuration does not contain a root property.
If you have no style configuration, remove the assets block from the configuration`);
	}
	const assetPath = fsPath.resolve(projectRoot, assets.root);
	if (!await fileUtils.isFolder(assetPath)) {
		return errorResult(`Can't find assets folder ${assets.root} (${assetPath})`);
	}
	return successResult({
		root: assets.root
	})
}


async function validateLocale(projectRoot: string, locale?: Partial<IYasppLocaleConfig>): Promise<IResponse<IYasppLocaleConfig>> {
	const defaultConfig: IYasppLocaleConfig = {
		langs: ["en"],
		defaultLocale: "en",
		pages: {},
		root: ""
	}
	if (!locale) {
		return successResult({ ...defaultConfig });
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


class YasppUtils implements IYasppUtils {
	public getArg(args: string[], key: string): string | null {
		const ind = args.indexOf(key);
		if (ind < 0) {
			return null;
		}
		if (ind >= args.length - 1) {
			return "";
		}
		const val = args[ind + 1] ?? "";
		return /^-/.test(val) ? "" : val;
	}

	public runProcess(exe: string, argv: string[], cwd: string): Promise<number> {
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

	/**
	* Both paths point to folders
	* @param fromPath
	* @param toPath 
	*/
	public diffPaths(fromPath: string, toPath: string): string {
		const SEP_RE = /[/\\]+/;
		const fromParts = fromPath.split(SEP_RE),
			toParts = toPath.split(SEP_RE);
		let rest: string = "";
		const retParts = [] as string[];
		for (let ind = 0, len = fromParts.length, toLen = toParts.length; ind < len; ++ind) {
			if (retParts.length || ind >= toLen) {
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
		else if (toParts.length > fromParts.length) {
			retParts.push(...toParts.slice(fromParts.length));
		}
		const relPath = retParts.join('/');
		return relPath.length < toPath.length ? relPath : toPath;

	}


	public trimPath(path: string): string {
		const parts = path.split(/[/\\]+/);
		return parts.slice(Math.max(0, parts.length - 3)).join('/');
	}


	/**
	 * Tries to copy the content of one folder to another
	 * @param srcPath 
	 * @param targetPath 
	 * @param clean 
	 * @returns Promise<string> with error message
	 */
	public async copyFolderContent(srcPath: string, targetPath: string, clean: boolean): Promise<string> {
		async function copyIt(resolve: (value: string | PromiseLike<string>) => unknown): Promise<unknown> {
			if (!await fileUtils.isFolder(srcPath)) {
				return resolve(`Content Folder ${srcPath} not found`);
			}
			if (await fileUtils.mkdir(targetPath)) {
				return resolve(`Target Folder ${targetPath} can't be created`);
			}
			if (clean) {
				const rmargs = ["-rf", '*'];
				const rmCode = await yasppUtils.runProcess("rm", rmargs, targetPath);
				if (rmCode !== 0) {
					resolve(`Failed to delete content of ${targetPath}`);
				}
			}
			else {
				const srcList = await fs.readdir(srcPath);
				const trgList = await fs.readdir(targetPath);
				if (srcList.length === trgList.length) {
					return resolve("");
				}
			}
			const cpargs = ["--update", "-r", '*', targetPath]
			const cpCode = await yasppUtils.runProcess("cp", cpargs, srcPath);
			console.log(`Copied ${yasppUtils.trimPath(srcPath)} to ${yasppUtils.trimPath(targetPath)}`);
			resolve(cpCode === 0 ? "" : `Error copying content, exit code ${cpCode}`);
		}

		return new Promise<string>(resolve => {
			copyIt(resolve)
				.catch(err => resolve(String(err)))
		})
	}

	public async validateConfig(projectRoot: string, config?: Partial<IYasppConfig>): Promise<IResponse<IYasppConfig>> {
		const validContent = await validateContent(projectRoot, config?.content),
			validLocale = await validateLocale(projectRoot, config?.locale),
			validStyle = await validateStyle(projectRoot, config?.style),
			validAsssets = await validateAssets(projectRoot, config?.assets),
			validNav = await validateNav(projectRoot, config?.nav)

		const errors = [validContent, validLocale, validStyle, validAsssets].filter(r => r.error).map(r => r.error!);
		return errors.length ?
			errorResult(errors.join('\n'))
			: {
				result: {
					content: validContent.result!,
					locale: validLocale.result!,
					style: validStyle.result!,
					assets: validAsssets.result!,
					nav: validNav.result!

				}
			}
	}

	public async loadJSONTemplate<TRet>(name: string): Promise<IResponse<TRet>> {
		const loadRes = await this.loadTemplate(name);
		if (loadRes.error) {
			return errorResult(loadRes.error);
		}
		try {
			const ret = parseJSON<TRet>(loadRes.result!);
			return ret ? successResult(ret) : errorResult(`Failed to load template ${name}`)
		}
		catch (err) {
			return errorResult(`Failed to load template ${name}: ${err}`)
		}
	}

	public async loadTemplate(name: string): Promise<IResponse<string>> {
		if (!name) {
			return errorResult("no template name provided");
		}
		try {
			name = name.replace(/\.tmpl\s*$/g, "");
			const tmplPath = fsPath.resolve(__dirname, `templates/${name}.tmpl`);
			if (!await fileUtils.isFile(tmplPath)) {
				return errorResult(`template file ${name} (${tmplPath}) not found`);
			}
			const result = await fs.readFile(tmplPath, "utf-8");
			return {
				result
			}
		}
		catch (err) {
			return errorResult(`error while loading template ${name}: ${err}`);
		}
	}

	public normalizePath(path: string): string {
		if (!path) {
			return "";
		}
		const match = WIN_DEVICE_RE.exec( path );
		let ret = "";
		if (match) {
			const drive = `/${match[1].toLowerCase()}/`;
			ret = path.replace(WIN_DEVICE_RE, drive );
		}
		return ret.replace(/\\/g, '/' );
	}
}


export const yasppUtils = new YasppUtils;

export async function loadYasppConfig(projectRoot: string): Promise<IResponse<IYasppConfig>> {
	try {
		const fname = "yaspp.config.json";
		const configPath = fsPath.resolve(projectRoot, fname);
		const userConfig = await fileUtils.readJSON<IYasppConfig>(configPath);
		if (!userConfig) {
			return errorResult(`Missing or invalid yaspp configuration file (${configPath})`);
		}
		return yasppUtils.validateConfig(projectRoot, userConfig);
	}
	catch (err) {
		return errorResult(`Error loading yaspp ${err}`);
	}
}

export async function loadYasppAppConfig(): Promise<IResponse<IYasppAppConfig>> {
	try {
		const projectRoot = ROOT_PATH;
		const fname = "yaspp.json";
		const configPath = fsPath.resolve(projectRoot, fname);
		const config = await fileUtils.readJSON<IYasppAppConfig>(configPath);
		if (!config?.root) {
			return errorResult(`Missing or invalid yaspp configuration file (${configPath})`);
		}
		const siteRoot = fsPath.resolve(ROOT_PATH, config.root);
		if (!await fileUtils.isFolder(siteRoot)) {
			return errorResult(`Can't find site folder ${config.root} (${siteRoot})`);
		}
		return successResult(config);
	}
	catch (err) {
		return errorResult(`Error loading yaspp ${err}`);
	}
}