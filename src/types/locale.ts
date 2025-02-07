export type LocaleId = string;

export type TextDirection = 'rtl' | 'ltr';

/**
 * One dictionary,usually loaded from json
 */
export type LocaleNamespace = Record<string, string>;
/**
 * Single Language dictionary - a map of namespace => dictionary
 */
export type LocaleLanguage = Map<string, LocaleNamespace>;
/**
 * A map of locale id (e.g. "fr") to a Language dictionary
 */
export type LocaleDictionary = Map<LocaleId, LocaleLanguage>;

export interface IMutableLocaleConfig {
    locales: string[];
	defaultLocale: string,
	logBuild: boolean;
	pages: Record<string, string[]>;
}

export type ILocaleConfig = Readonly<IMutableLocaleConfig>;

export interface I18NConfig extends ILocaleConfig {
    loadLocaleFrom?: (lang: string, ns: string) => Promise<unknown>;
    readonly dictionaries: {
		system: Record<string, string>;
		project: Record<string, string>;
	}

}