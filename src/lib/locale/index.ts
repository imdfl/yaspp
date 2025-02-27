
/**
 * With next-translate, arg can be a dictionary from  which to take {{ values }}
 */
export type LocalizeFunction = (s: string, arg?: object) => string;
const TRANSLATED_STRING_REGEXP = /\[\[(.+?)\]\]/g;
const RTL_LANGS = new Set<string>(["he", "ar"]);

function _isRTL(lang: string): boolean {
	return Boolean(lang && RTL_LANGS.has(lang));
}

function _localize(text: string, localizeFunction: LocalizeFunction, params?: object): string {
	if (!text) {
		return localizeFunction("");
	}
	return (TRANSLATED_STRING_REGEXP.test(text)) ?
		text.replace(TRANSLATED_STRING_REGEXP, function (_, key: string) {
			return localizeFunction(key, params);
		})
		: localizeFunction(text);
}

export const localizeString = _localize;
export const isRTL = _isRTL;