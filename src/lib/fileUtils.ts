import { parse as parseJSON } from 'json5';
import { promises as fs } from 'fs';
import fsPath from "path";
import { rimraf } from "rimraf";
import type { IResponse } from "../../src/types";
import { errorResult, operationResult } from './yaspp/yaspp-lib';


export type FileType = "" | "file" | "folder" | "other";

interface ILnkOptions {
	cwd: string;
	force: boolean;
	rename: string;
	type: "default" | "hard" | "symbolic" | "junction" |"directory"
}

type LnkFunction = (targets: string | string[], 
	directory: string, 
	options?: Partial<ILnkOptions>) => Promise<Array<string | undefined>>;

const linkIt = require("lnk") as LnkFunction;
/**
 * Helpers for ML API implementation
 */

export interface IRemoveFolderOptions {
	readonly path: string;
	readonly removeRoot: boolean;
	/**
	 * If true, return an error if the folder does not  exist
	 */
	readonly mustExist?: boolean;
}

export interface ISymlinkOptions {
	readonly srcPath: string;
	readonly targetFolder: string;
	readonly name?: string;
	readonly overwrite?: boolean;
}

export interface IFileUtils {

	/**
	 * Returns a filename that ends with the required extension
	 * @param fileName can be with or without an extension
	 * @param extension can be with or without initial `.`
	 */
	assertFileExtension(fileName: string, extension: string): string;

	/**
	 * Tries to create a symlink to srcPath in targetFolder
	 * @param srcPath
	 * @param targetFolder 
	 * @param name Optional new name of the link
	 * @returns Full path of symlink or empty string if failed
	 */
	symLink(options: ISymlinkOptions): Promise<IResponse<string>>;

	/**
	 * Handles various scenarios and swallows errors
	 * @returns error string if any
	 * @param path
	 */
	mkdir(path: string): Promise<string>;

	/**
	 * safe testif a file exists or what its type is
	 * @param fspath 
	 * @returns empty string if the file doesn't exist, otherwise "file", "folder", "other"
	 */
	getFileType(fspath: string): Promise<FileType>;
	/**
	 * resolves to true if the provided path points to an existing folder
	 * @param fspath: file system path
	 */
	isFolder(fspath: string): Promise<boolean>;
	/**
	 * resolves to true if the provided path points to an existing file (not folder)
	 * @param fspath: file system path
	 */
	isFile(fspath: string): Promise<boolean>;
	/**
	 * resolves to true if the provided path points to an existing file or folder
	 * @param fspath: file system path
	 */
	isFileOrFolder(fspath: string): Promise<boolean>;

	/**
	 * Simple wrapper to read json/jsonc
	 * @param path
	 */
	readJSON<T = Record<string, string>>(path: string, options?: { canFail?: boolean }): Promise<T | null>;

	/**
	 * Simple wrapper to read file content, swallws errors
	 * @param path
	 */
	readFile(path: string, options?: { canFail?: boolean }): Promise<string | null>;

	/**
	 * Remove either the folder or all its content, based on options.removeRoot
	 * @param options 
	 */
	removeFolder(options: IRemoveFolderOptions): Promise<boolean>;


}

class FileUtils implements IFileUtils {

	public 	assertFileExtension(fileName: string, extension: string): string {
		if (!fileName) {
			return "";
		}
		extension = '.' + (extension || "").replace(/^\.+/, '');
		return fileName.replace(/\.[^.]+$/, "") + extension;
	}

	public async readJSON<T = Record<string, string>>(path: string, options?: { canFail?: boolean }): Promise<T | null> {
		try {
			const str = await this.readFile(path, options);
			if (str === null) {
				return null;
			}
			return parseJSON<T>(str);
		}
		catch (err) {
			console.error(`Error reading json data from ${path}: ${err}`);
			return null;
		}
	}

	public async readFile(path: string, options?: { canFail?: boolean }): Promise<string | null> {
		try {
			const str = await fs.readFile(path, "utf-8");
			return str;
		}
		catch (err) {
			if (!options?.canFail) {
				console.error(`Error reading data from ${path}: ${err}`);
			}
			return null;
		}
	}

	/**
	 * 
	 * @param srcPath
	 * @param targetFolder 
	 * @param name 
	 * @returns 
	 */
	public async symLink({
		srcPath, targetFolder, name, overwrite
	}: ISymlinkOptions): Promise<IResponse<string>> {
		if (!srcPath || !targetFolder) {
			return errorResult(`symlink: missing source ${srcPath} or target ${targetFolder}`);
		}
		const t = await this.getFileType(srcPath);
		if (t !== "file" && t !== "folder") {
			return errorResult(`symlink: illegal source type ${t}`);
		}
		if (!await this.isFolder(targetFolder)) {
			return errorResult(`symlink: target not a folder ${targetFolder}`);
		}
		const linkName = name || fsPath.basename(srcPath),
			targetPath = fsPath.resolve(targetFolder, linkName);
		// const cwd = process.cwd();
		try {
			const curType = await this.getFileType(targetPath);
			if (curType) {
				if (!overwrite) {
					return errorResult(`symlink: target exists and overwrite is not true ${targetPath}`);
				}
				else {
					await fs.unlink(targetPath);
				}
			}
			// process.chdir(targetFolder);
			const res = await linkIt(srcPath, targetFolder, {
				rename: linkName
			});

			return operationResult(res[0], targetPath);
		}
		catch (e) {
			return errorResult(`symlink: error ${e}`);
		}

		// 	fs.symlink(src, target, (err) => {
		// 		var status = err ? 1 : 0;
		// 		if (err) {
		// 			console.error(`symlink error: ${err}`);
		// 		}
		// 		process.exit(status);
		// 	});
		// }
		// else {
		// 	console.error(`src or target not provided`);
		// 	process.exit(1);
		// }
	}

	public async getFileType(fspath: string): Promise<FileType> {
		try {
			const info = await fs.lstat(fspath);
			if (!info) {
				return "";
			}
			if (info.isDirectory()) {
				return "folder";
			}
			if (info.isFile()) {
				return "file";
			}
			return "other";
		}
		catch (e) {
			return "";
		}
	}

	public async removeFolder({ path, removeRoot, mustExist = false }: IRemoveFolderOptions): Promise<boolean> {
		if (!await fileUtils.isFolder(path)) {
			return !mustExist;
		}
		const success = await rimraf(removeRoot ? path : `${path}/*`, {
			glob: !removeRoot
		});
		return success;
	}

	public async isFolder(fspath: string): Promise<boolean> {
		const t = await this.getFileType(fspath);
		return t === "folder";
	}
	public async isFile(fspath: string): Promise<boolean> {
		const t = await this.getFileType(fspath);
		return t === "file";
	}

	public async isFileOrFolder(fspath: string): Promise<boolean> {
		const t = await this.getFileType(fspath);
		return t === "folder" || t === "file";
	}

	public async mkdir(path: string): Promise<string> {
		const t = await this.getFileType(path);
		if (t === "folder") {
			return "";
		}
		if (t) {
			return `mkdir: file already exists at ${path}`;
		}
		try {
			await fs.mkdir(path, { recursive: true });
			return "";
		}
		catch (err) {
			return `mkdir ${path} failed: ${err}`;
		}
	}
}

export const fileUtils: IFileUtils = new FileUtils();
