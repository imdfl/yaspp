import { parse as parseJSON } from 'json5';
import { promises as fs } from 'fs';
import { rimraf } from "rimraf";


export type FileType = "" | "file"| "folder" | "other";
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

export interface IFileUtils {

    /**
     * Handles various scenarios and swallows errors
     * @param path
     */
    mkdir(path: string): Promise<string>;

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
    readJSON<T = Record<string, string>>(path: string): Promise<T | null>;

    /**
     * Remove either the folder or all its content, based on options.removeRoot
     * @param options 
     */
    removeFolder(options: IRemoveFolderOptions): Promise<boolean>;


}

class FileUtils implements IFileUtils {
    public async readJSON<T = Record<string, string>>(path: string): Promise<T | null> {
        try {
            const str = await fs.readFile(path, "utf-8");
            return parseJSON<T>(str);
        }
        catch (err) {
            console.error(`Error reading json data from ${path}: ${err}`);
            return null;
        }
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
        const t  = await this.getFileType(path);
        if (t === "folder") {
            return "";
        }
        if (t) {
            return `file already exists at ${path}`;
        }
        try {
            await fs.mkdir(path, { recursive: true});
            return "";
        }
        catch(err) {
            return `mkdir ${path} failed: ${err}`;
        }
    }
}

export const fileUtils: IFileUtils = new FileUtils();
