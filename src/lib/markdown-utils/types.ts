import { LoadFolderModes } from "@src/types/parser/modes";
import type { IContentParseOptions } from "@src/types/parser/parser";
import type { IYasppApp } from "@src/types/app";
import type { LocaleDictionary, LocaleId } from "@src/types";

export interface ILoadContentOptions {
	readonly app: IYasppApp;
	/** Defaults to FOLDER */
	readonly loadMode: LoadFolderModes;
	/** The content path, relative to the content folder */
	readonly relativePath: string;
	/** If true, iterate over children folders */
	readonly locale: string;
	readonly mode?: Partial<IContentParseOptions>;
}


export interface IFigureInfo {
	readonly index: number;
	readonly realIndex: number;
	readonly id: string;
}


export interface ITranslateStringOptions {
	/**
	 * Must be prefixed by namespace, e.g. "myns:key"
	 */
	readonly text: string;
	readonly locale: LocaleId;
	readonly dictionary: LocaleDictionary;
	/**
	 * Optional default locale to use if the language or the text are not found in the designated locale
	 */
	readonly defaultLocale?: string;
}
