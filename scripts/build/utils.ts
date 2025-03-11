/* eslint-disable no-inner-declarations */

import { promises as fs } from "fs";
import fsPath from "path";
import { parse as parseJSON } from "json5";

import type { IResponse, NotNull } from "@src/types";
import { fileUtils } from '../../src/lib/fileUtils';
import { errorResult, runProcess, successResult } from "../../src/lib/yaspp/yaspp-lib";

const WIN_DEVICE_RE = /^([A-Z]):[\\\/]+/i; // eslint-disable-line no-useless-escape

export interface IYasppUtils {
	/**
	 * Given an argv style argument array, tries to find the param following the given key, so
	 * 
	 * `init-yaspp --project ../mels-loop`
	 * @param args 
	 * @param key 
	 */
	getArg(args: string[], key: string): string | null;

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

function equalArrays(arr1: string[], arr2: string[]): boolean {
	if (!arr1?.length) {
		return !arr2?.length;
	}
	if (arr1.length !== arr2?.length) {
		return false;
	}
	const items1 = new Set(arr1);
	const ind = arr2.findIndex(s => !items1.has(s));
	return ind < 0;

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

	public exitWith(err: string): void {
		if (err) {
			console.error(err);
		}
		process.exit(err ? 1 : 0);
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
				const rmCode = await runProcess("rm", rmargs, targetPath);
				if (rmCode !== 0) {
					resolve(`Failed to delete content of ${targetPath}`);
				}
			}
			else {
				const srcList = await fs.readdir(srcPath);
				const trgList = await fs.readdir(targetPath);
				if (equalArrays(srcList, trgList)) {
					return resolve("");
				}
			}
			const cpargs = ["--update", "-r", '*', targetPath]
			const cpCode = await runProcess("cp", cpargs, srcPath);
			console.log(`Copied ${yasppUtils.trimPath(srcPath)} to ${yasppUtils.trimPath(targetPath)}`);
			resolve(cpCode === 0 ? "" : `Error copying content, exit code ${cpCode}`);
		}

		return new Promise<string>(resolve => {
			copyIt(resolve)
				.catch(err => resolve(String(err)))
		})
	}


	public async loadJSONTemplate<TRet extends NotNull>(name: string): Promise<IResponse<TRet>> {
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