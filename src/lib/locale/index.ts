
export type LocalizeFunction = (s: string) => string;
const TRANSLATED_STRING_REGEXP = /\[\[(.+?)\]\]/g;
const RTL_LANGS = new Set<string>(["he", "ar"]);

function _isRTL(lang: string): boolean {
	return Boolean(lang && RTL_LANGS.has(lang));
}

function _localize(text: string, localizeFunction: LocalizeFunction): string {
	if (!text) {
		return localizeFunction("");
	}
	return (TRANSLATED_STRING_REGEXP.test(text)) ?
		text.replace(TRANSLATED_STRING_REGEXP, function (_, key: string) {
			return localizeFunction(key);
		})
		: localizeFunction(text);
}

export const localizeString = _localize;
export const isRTL = _isRTL;