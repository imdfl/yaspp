/* eslint-disable no-inner-declarations */

///////////////////////////////////////////////////////////
////// Utilities for yaspp scripts ////////////////////////
///////////////////////////////////////////////////////////

import { promises as fs } from "fs";
import fsPath from "path";
import { parse as parseJSON } from "json5";

import type { IOperationResult, NotNull } from "types";
import { fileUtils } from "@lib/fileUtils";
import { captureProcessOutput, errorResult, successResult } from "@lib/yaspp/yaspp-lib";

const WIN_DEVICE_RE = /^([A-Z]):[\\\/]+/i; // eslint-disable-line no-useless-escape

export interface IYasppUtils {
	/**
	 * Given an argv style argument array, tries to find the param following the given key, so
	 * 
	 * `init-yaspp --project ../mels-loop`
	 * @param args 
	 * @param key 
	 */
	getArg(args: ReadonlyArray<string>, key: string): string | null;

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
	loadTemplate(name: string): Promise<IOperationResult<string>>;

	toPosixPath(path: string): string;

	/**
	 * Tries to load environment variables from the root,according to the next conventions
	 */
	loadEnv(): Promise<void>;
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

	public async loadEnv(): Promise<void> {
		try {
			const files = [
				".env"
			],
			env = process.env.NODE_ENV;
			if (env){
				files.push(`.env.${env}`);
			}
			const root = fsPath.resolve(__dirname, "../..");
			for await (const file of files) {
				const fpath = fsPath.resolve(root, file);
				const data = await fileUtils.readFile(fpath, { canFail: true});
				if (data) {
					const lines = data
						.split(/[\n\r]/)
						.map(s => s.replace(/(^|[^\\])#.*$/g, "$1").replace(/\\#/g, "#")) // remove comments
						.filter(Boolean)
					lines.forEach(line => {
						const  [key, value] = line.split('=');
						if (key && value) {
							const val = value.trim()
								.replace(/^'(.*)'$/, "$1") // single quoted strings -> string
								.replace(/^"(.*)"$/, "$1"); // double quoted
							if (val) {
								process.env[key] = val;
							}
						}
					})
				}
			}
		}
		catch(err) {
			console.error(`Error loading environment: ${err}`);
		}
	}

	public getArg(args: ReadonlyArray<string>, key: string): string | null {
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


	private static forbidden = [
		// starting with / and at most one folder
		/^\/[^/]*\/?$/, 
		// any folder with /bin in its path
		/(^|\/)bin(\/|$)/
	] as ReadonlyArray<RegExp>;

	/**
	 * Tries to copy the content of one folder to another
	 * logs the result to console
	 * @param srcPath 
	 * @param targetPath 
	 * @param clean 
	 * @returns Promise<string> with error message
	 */
	public async copyFolderContent(srcPath: string, targetPath: string, clean: boolean): Promise<string> {

		function isForbidden(url: string): boolean {
			if (!url) {
				return true;
			}
			url = url.replace(/\\/g, '/').replace(/^[a-z]:/i, '');
			const ind = YasppUtils.forbidden.findIndex(r => r.test(url));
			return ind >= 0;
		}
		async function copyIt(resolve: (value: string | PromiseLike<string>) => unknown): Promise<unknown> {
			if (!await fileUtils.isFolder(srcPath)) {
				return resolve(`Content Folder ${srcPath} not found`);
			}
			if (isForbidden(targetPath)) {
				return resolve(`Can't copy to ${targetPath}: forbidden`);
			}
			if (await fileUtils.mkdir(targetPath)) {
				return resolve(`Target Folder ${targetPath} can't be created`);
			}
			if (clean) {
				const rmargs = ["-rf", '*'];
				const rr = await captureProcessOutput({
					cwd: targetPath,
					exe: "rm",
					argv: rmargs
				})
				if (rr.status !== 0) {
					resolve(`Failed to delete content of ${targetPath}: ${rr.errors.join('\n')}`);
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
			const cpResult = await captureProcessOutput({
				exe: "cp", 
				argv: cpargs,
				cwd: srcPath
			});
			const err = cpResult.status === 0 ? "" : `Error copying ${srcPath} to ${targetPath},
exit code ${cpResult.status},
errors ${cpResult.errors}`;
			console.log(err || `Copied ${srcPath} to ${targetPath}`);
			resolve(err);
		}

		return new Promise<string>(resolve => {
			copyIt(resolve)
				.catch(err => resolve(String(err)))
		})
	}


	public async loadJSONTemplate<TRet extends NotNull>(name: string): Promise<IOperationResult<TRet>> {
		const loadRes = await this.loadTemplate(name);
		if (loadRes.error) {
			return errorResult(loadRes.error);
		}
		try {
			const ret = parseJSON<TRet>(loadRes.result);
			return ret ? successResult(ret) : errorResult(`Failed to load template ${name}`)
		}
		catch (err) {
			return errorResult(`Failed to load template ${name}: ${err}`)
		}
	}

	public async loadTemplate(name: string): Promise<IOperationResult<string>> {
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

	public toPosixPath(path: string): string {
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