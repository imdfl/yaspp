import { ComponentPath, IComponentPath } from "@src/types/components";
import { stringUtils } from "@lib/stringUtils";

export function pathToArray(path: string | readonly string[]): string[] {
	return (Array.isArray(path)) ?
		path
		: stringUtils.toStringArray(path, {
			delimiter: '.',
			flatten: true,
			unique: false,
			allowEmpty: false,
			trim: true
		})
}

export function pathToString(path: ComponentPath): string {
	if (!path?.length) {
		return "";
	}
	return Array.isArray(path) ? pathToArray(path).join('.') : String(path);
}


class CPath implements IComponentPath {
	private readonly _path: string[];

	constructor(path: string | readonly string[]) {
		this._path = pathToArray(path);
	}

	public clone(): IComponentPath {
		return new CPath(this._path);
	}

	public toString(): string {
		return this.asString;
	}

	public get parentPath(): IComponentPath {
		const parts = this._path.slice(0, -1);
		return new CPath(parts);
	}
	public get asString(): string {
		return this._path.join('.');
	}
	public get asArray(): string[] {
		return this._path.slice();
	}
	add(...parts: string[]): IComponentPath {
		const paths = parts.reduce((arr, part) => {
			const pts = pathToArray(part);
			arr.push(...pts);
			return arr;
		}, [] as string[]);
		return new CPath(this._path.concat(paths));
	}

}

export const createComponentPath = (path: ComponentPath): IComponentPath => {
	return new CPath(path);
}