import React, { Context, createContext } from "react";
import useTranslation from 'next-translate/useTranslation';
import type {
	ILocaleContext,
	ILocaleContextProps,
} from "./localeContext.d";

import { NextRouter } from "next/router";
import type { LocaleId, TextDirection } from "../types";
import { Translate } from "next-translate";
import { isRTL, LocalizeFunction, localizeString } from "@lib/locale";

class LocaleContextImpl implements ILocaleContext {
	private _locale: string;
	private _locales: string[];
	// private _translate: (s: string, lang?: LocaleId) => string;
	private readonly _router: NextRouter;
	private readonly _t: Translate;
	private readonly _translate: LocalizeFunction;
	constructor(props: ILocaleContextProps) {
		if (!props) {
			return;
		}
		const { router, translate } = props;
		this._t = translate;
		this._translate = (s, arg) => localizeString(s, translate, arg);
		this._router = router;
		this._locale = props.locale;
		this._locales = router.locales;
	}

	public get textDirection(): TextDirection {
		// code repeated because this is called a lot
		return isRTL(this._locale) ? "rtl" : "ltr";
	}

	public get translate(): LocalizeFunction {
		return this._translate;
	}

	public get t(): Translate {
		return this._t;
	}

	public getTextDirection(locale?: string): TextDirection {
		locale = locale || this._locale;
		return isRTL(locale) ? "rtl" : "ltr";
	}

	private get router() {
		return this._router;
	}

	private get asPath() {
		return this.router.asPath;
	}

	public get locale() {
		return this._locale;
	}

	public get locales() {
		return this._locales;
	}

	// public getLocaleLabel = (id: string) =>
	// 	[localeLabelPrefix, id].join("_").toUpperCase();

	// public getLocaleSymbol = (id: string) =>
	// 	this.translate(this.getLocaleLabel(id));

	// public translate = (key: string, lang?: LocaleId) =>
	// 	this._translate(key, lang);

	public setLocale = (locale: LocaleId) =>
		this.router.push(this.asPath, this.asPath, {
			locale,
			scroll: true,
		});
}

const ctx = createContext<ILocaleContext>(new LocaleContextImpl(null));

export const LocaleContext: Context<ILocaleContext> = ctx;

export const LocaleContextProvider = ({ children, router }) => {
	const { t, lang } = useTranslation();
	return (
		<LocaleContext.Provider value={new LocaleContextImpl({ router, locale: lang, translate: t })}>
			{children}
		</LocaleContext.Provider>
	);
};
