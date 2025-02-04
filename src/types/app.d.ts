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
}

export type LocaleLoader = (lang: string, ns?: string) => Promise<Record<string, string>>;
export interface I18NConfig {
	readonly langs: ReadonlyArray<string>;
	readonly defaultLocale: string;
	readonly pages: Record<string, ReadonlyArray<string>>;
}

export interface IYasppLocaleConfig extends I18NConfig {
	readonly root: string;
}

export interface IYasppContentConfig {
	readonly root: string;
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

