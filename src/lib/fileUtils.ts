import { parse as parseJSON } from 'json5';
import { promises as fs } from 'fs';

/**
 * Helpers for ML API implementation
 */
export interface IFileUtils {
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
    readJSON<T = Record<string, string>>(path: string): Promise<T | null>

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


    public async isFolder(fspath: string): Promise<boolean> {
        try {
            const info = await fs.lstat(fspath);
            return Boolean(info?.isDirectory());
        }
        catch (e) {
            return false;
        }
    }
    public async isFile(fspath: string): Promise<boolean> {
        try {
            const info = await fs.lstat(fspath);
            return Boolean(info?.isFile());
        }
        catch (e) {
            return false;
        }
    }

    public async isFileOrFolder(fspath: string): Promise<boolean> {
        try {
            const info = await fs.lstat(fspath);
            return Boolean(info?.isFile() || info?.isDirectory());
        }
        catch (e) {
            return false;
        }
    }
}

export const fileUtils: IFileUtils = new FileUtils();
