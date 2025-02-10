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

interface IYasppBaseConfig {
	/**
	 * Relative to project root, all content is copied to `/public`, e.g. `/public/content`, `/public/locales`
	 */
	readonly root: string;
}

export type IYasppLocaleConfig = IProjectLocaleConfig & IYasppBaseConfig;
export interface IYasppContentConfig extends IYasppBaseConfig{
	/**
	 * Mandatory path to index folder relative to the content root folder, e.g. `docs` which is expected to contain
	 * at least a content folder for the default locale, e.g. 'en'
	 */
	readonly index: string;
}

export interface IYasppStyleConfig extends IYasppBaseConfig {
	/**
	 * Optional Path to main css file, relative to the style root , defaults to site.scss (generated if no css is provided by the user)
	 */
	readonly index?: string;
}

export type IYasppAssetsConfig = IYasppBaseConfig;

/**
 * Project configuration file
 */
export interface IYasppConfig {
	readonly content: IYasppContentConfig;
	readonly locale: IYasppLocaleConfig;
	readonly style?: IYasppStyleConfig;
	readonly assets?: IYasppStyleConfig;
}

/**
 * The configuration stored in the yaspp root
 */
export interface IYasppAppConfig extends IYasppConfig {
	readonly root: string;
}

