import { LocaleDictionary, LocaleId } from "./locale";

/**
 * App object that contains data about the current build
 */
export interface IYasppApp {
	/**
	 * The full path of the content folder
	 */
	readonly contentPath: string;
	/**
	 * The relative (to the content path) path of the index page
	 */
	readonly indexPath: string;
	/**
	 * True if this app was initialized successfully and found all its paths
	 */
	readonly isValid: boolean;

	/**
	 * Map of locale id (e.g. "en") to a map of namespace => key:value
	 */
	readonly dictionary: LocaleDictionary;

	/**
	 * Default locale to start with and use as fallback in translations
	 */
	readonly defaultLocale: LocaleId;
}

export type LocaleLoader = (lang: string, ns?: string) => Promise<Record<string, string>>;
export interface IProjectLocaleConfig {
	readonly langs: ReadonlyArray<string>;
	readonly defaultLocale: string;
	readonly pages: Record<string, ReadonlyArray<string>>;
}


export interface IYasppLocaleConfig extends IProjectLocaleConfig {
	readonly root: string;
}

export interface IYasppContentConfig {
	/**
	 * Relative to project root
	 */
	readonly root: string;
	/**
	 * Path to index document, defaults to pages/index.md
	 */
	readonly index: string;
}

/**
 * Project configuration file
 */
export interface IYasppConfig {
	readonly content: IYasppContentConfig;
	readonly locale: IYasppLocaleConfig;
}

/**
 * The configuration stored in the yaspp root
 */
export interface IYasppAppConfig extends IYasppConfig {
	readonly root: string;
}

