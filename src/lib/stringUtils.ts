import { IOperationResult, Nullable } from "../types";
import { parse as parseJSON } from "json5";

export type StringCaseTransform = "lower" | "upper";
/**
 * Options for toStringArray
 */
export interface IStringArrayOptions<TStr extends string = string> {
	/**
	 * If false, filter out empty strings
	 */
	readonly allowEmpty: boolean;
	/**
	 * Optional, "lower" or "upper"
	 */
	readonly transform: StringCaseTransform;
	/**
	 * Optional, if true - return an array with unique members
	 */
	readonly unique: boolean;
	/**
	 * Optional, if false - don't trim
	 */
	readonly trim: boolean;
	/**
	 * Optional, defaults to ','
	 */
	readonly delimiter: string | false;

	/**
	 * Underscore to avoid silly warnings. If present, allow only strings from this array (case sensitive)
	 */
	readonly _enum: ReadonlyArray<TStr>;
}

export interface IStringUtils {
	toStringArray<TString extends string = string>(
		strings?: TString | ReadonlyArray<TString>,
		opts?: Partial<IStringArrayOptions<TString>>
	): Array<TString>;

	parseJSON<T extends object>(
		data: string,
		reviver?: ((this: unknown, key: string, value: unknown) => unknown)
	): IOperationResult<T>;
}

class StringUtils implements IStringUtils {
	public parseJSON<T extends object>(
		data: string,
		reviver?: ((this: unknown, key: string, value: unknown) => unknown)
	): IOperationResult<T> {

		try {
			return { result: parseJSON(data, reviver) }
		}
		catch (e) {
			return {
				error: String(e)
			}
		}
	}


	public toStringArray<TString extends string = string>
		(strings?: TString | ReadonlyArray<TString>,
			opts?: Partial<IStringArrayOptions<TString>>): Array<TString> {
		if (!strings?.length) {
			return [];
		}
		opts ??= {};
		const options: IStringArrayOptions = {
			transform: opts.transform,
			unique: opts.unique ?? false,
			delimiter: opts.delimiter ?? ',',
			trim: opts.trim !== false,
			_enum: Array.isArray(opts._enum) ? opts._enum : [],
			allowEmpty: opts.allowEmpty !== false
		};

		let ret: TString[];
		const transform: Nullable<(s: string) => string> = options.transform === "upper" ? s => s.toUpperCase() :
			options.transform === "lower" ? s => s.toLowerCase() : null;

		const trim = options.trim !== false;

		if (typeof strings === "string") {
			ret = (options.delimiter ? strings.split(options.delimiter) : [strings]) as TString[];
		}
		else if (Array.isArray(strings)) {
			ret = strings;
		}
		else {
			console.warn("illegal format of string array");
			return [];
		}
		ret.forEach((s: string, i: number) => {
			if (s === null || s === undefined) {
				s = "";
			}
			s = String(s);
			if (trim) {
				s = s.trim();
			}
			if (transform) {
				s = transform(s);
			}
			ret[i] = s as TString;
		});
		if (options.unique) {
			const strSet = new Set<string>();
			ret = ret.reduce((arr: TString[], str) => {
				if (!strSet.has(str)) {
					strSet.add(str);
					arr.push(str);
				}
				return arr;
			}, [])
		}
		if (options._enum.length) {
			ret = ret.map(s => {
				return options._enum?.includes(s) ? s : null
			}).filter(Boolean);
		}

		return options.allowEmpty ? ret : ret.filter(s => s.length);
	}

}

export const stringUtils: IStringUtils = new StringUtils();
