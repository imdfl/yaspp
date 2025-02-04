export type LocaleId = string;

export type TextDirection = 'rtl' | 'ltr';

export interface IMutableLocaleConfig {
    locales: string[];
	defaultLocale: string,
	logBuild: boolean;
	pages: Record<string, string[]>;
}

export type ILocaleConfig = Readonly<IMutableLocaleConfig>;

export interface I18NConfig extends ILocaleConfig {
    loadLocaleFrom?: (lang: string, ns: string) => Promise<unknown>;
}