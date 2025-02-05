import { LocaleId, TextDirection } from 'types';
// import i18n from '../../i18n.json' with { type: 'json'};
import useTranslation from 'next-translate/useTranslation';
import i18n from '../../i18n';
import { LocaleContext } from '../contexts/localeContext';
import { useContext } from 'react';

type LocaleProps = (id?: LocaleId) => {
	lang: LocaleId;
	locales: LocaleId[];
	textDirection: TextDirection;
	t: (key: string, options?: Record<string, unknown>) => string;
};

export const useLocale: LocaleProps = () => {
	const { t, lang } = useTranslation();
	const localeContext = useContext(LocaleContext);

	const current = lang;
	const locales = i18n['locales'] as string[];
	// const directions = i18n['direction'] as Record<LocaleId, TextDirection>;
	// const textDirection = directions[id || current];

	return {
		lang: current,
		locales,
		textDirection: localeContext.textDirection(lang),
		t,
	};
};
