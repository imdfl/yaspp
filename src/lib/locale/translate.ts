import { ITranslateStringOptions } from "../markdown-utils/types";

export const _translate = ({ text, locale, dictionary, defaultLocale }: ITranslateStringOptions): string => {
	const parts = text?.split(':');
	function wrapStr() {
		return `%${locale}_${text}$%`;
	}
	if (!(parts?.length > 1)) {
		return text;
	}
	function tryDefault(): string {
		if (defaultLocale && locale !== defaultLocale) {
			return _translate({
				text, locale: defaultLocale, dictionary
			});
		}
		return wrapStr();
	}
	const lang = dictionary.get(locale);
	if (!lang) {
		return tryDefault();
	}
	const nsName = parts[0],
		dict = lang.get(nsName);
	if (!dict) {
		return tryDefault();
	}
	const key = parts.slice(1).join(':'),
		value = dict[key];
	return value || tryDefault();
};

export const wrapTranslate = ({ dictionary, locale, defaultLocale }: Omit<ITranslateStringOptions, "text">): ((text: string) => string) => {
	// the params are saved locally so we don't ref an object that may change
	return (text: string) => _translate({
		text,
		dictionary,
		locale,
		defaultLocale
	})
}
