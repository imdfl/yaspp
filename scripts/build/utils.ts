import { promises as fs } from "fs";
import fsPath from "path";
import { spawn } from "child_process";
import { parse as parseJSON } from "json5";

import type { IYasppContentConfig, IYasppConfig, IYasppLocaleConfig, IYasppAppConfig } from "../../src/types/app";
import { fileUtils } from "../../src/lib/fileUtils";

export interface IResponse<T> {
	result: T | null;
	error?: string;
}

export interface IYasppUtils {
	getArg(args: string[], key: string): string | null;
	runProcess(exe: string, argv: string[], cwd: string): Promise<number>;
	trimPath(path: string): string;
	copyContent(srcPath: string, targetPath: string, clean: boolean): Promise<string>;
	validateConfig(projectRoot: string, config?: Partial<IYasppConfig>): Promise<IResponse<IYasppConfig>>;
}

export interface IYasppLoadOptions {
	readonly validate: boolean;
}

function errorResult<TResult = IYasppConfig>(err: string): IResponse<TResult> {
	return {
		result: null,
		error: err
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
	if (content.index) {
		const indexPath = fsPath.resolve(contentPath, content.index);
		if (!await fileUtils.isFileOrFolder(indexPath)) {
			return errorResult(`Can't find index at ${content.index} (${indexPath})`);
		}
	}
	return {
		result: {
			root: content.root,
			index: content.index || "index.md"
		}
	}
}

async function validateLocale(projectRoot: string, locale?: Partial<IYasppLocaleConfig>): Promise<IResponse<IYasppLocaleConfig>> {
	const defaultConfig: IYasppLocaleConfig = {
		langs: ["en"],
		defaultLocale: "en",
		pages: {},
		root: ""
	}
	if (!locale) {
		return { result: { ...defaultConfig } }
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
	return {
		result: {
			root: locale.root || "",
			langs,
			defaultLocale,
			pages
		}
	}
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
	
			proc.on('close', function () {
				const code = Number(proc.exitCode);
				resolve(isNaN(code) ? 1 : code);
			});
		})
	
	}

	public trimPath(path: string): string {
		const parts = path.split(/[\/\\]+/);
		return parts.slice(Math.max(0, parts.length - 3)).join('/');
	}

	public copyContent(srcPath: string, targetPath: string, clean: boolean): Promise<string> {
		return new Promise<string>(async resolve => {
			if (!await fileUtils.isFolder(srcPath)) {
				return resolve(`Content Folder ${srcPath} not found`);
			}
			await fs.mkdir(targetPath, { recursive: true });
			if (!await fileUtils.isFolder(targetPath)) {
				return resolve(`Target Folder ${targetPath} not found`);
			}
			if (clean) {
				const rmargs = ["-rf", '*'];
				const rmCode = await yasppUtils.runProcess("rm", rmargs, targetPath);
				if (rmCode !== 0) {
					resolve(`Failed to delete content of ${targetPath}`);
				}
			}
			const cpargs = ["--update", "-r", '*', targetPath]
			const cpCode = await yasppUtils.runProcess("cp", cpargs, srcPath);
			console.log(`Copied ${yasppUtils.trimPath(srcPath)} to ${yasppUtils.trimPath(targetPath)}`);
			resolve(cpCode === 0 ? "" : `Error copying content, exit code ${cpCode}`);
		});
	}

	public async validateConfig(projectRoot: string, config?: Partial<IYasppConfig>): Promise<IResponse<IYasppConfig>> {
		const validContent = await validateContent(projectRoot, config?.content);
		if (validContent.error) {
			return errorResult(validContent.error);
		}
		const validLocale = await validateLocale(projectRoot, config?.locale);
		if (validLocale.error) {
			return errorResult(validLocale.error);
		}
		return {
			result: {
				content: validContent.result!,
				locale: validLocale.result!
			}
		}
	}
}


export const yasppUtils = new YasppUtils;

export async function loadYasppConfig(projectRoot: string, options: IYasppLoadOptions): Promise<IResponse<IYasppConfig>> {
	try {
		const configPath = fsPath.resolve(projectRoot, "yaspp.json");
		if (!await fileUtils.isFile(configPath)) {
			return { error: `Can't find yaspp configuration file (${configPath})`, result: null };
		}
		const data = await fs.readFile(configPath, "utf-8");
		const userConfig = parseJSON<Partial<IYasppConfig>>(data);
		return options.validate ? yasppUtils.validateConfig(projectRoot, userConfig) : { result: userConfig as IYasppConfig};
	}
	catch (err) {
		return {
			result: null,
			error: `Error loading yaspp ${err}`
		}
	}
}

export async function loadYasppAppConfig(options:IYasppLoadOptions): Promise<IResponse<IYasppAppConfig>> {
	const rootPath = fsPath.resolve(__dirname, "../..");
	const { result, error } = await loadYasppConfig(rootPath, options);
	if (error) {
		return errorResult(error);
	}
	return {
		result: {
			root: rootPath,
			...result!
		}
	}
}

