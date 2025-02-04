import React, { Context, createContext } from "react";
import {
	ILocaleContext,
	ILocaleContextProps,
	localeLabelPrefix,
} from "./localeContext.d";
import { _translate } from "@lib/locale/translate";
import { Languages } from "@lib/locale";
import { NextRouter } from "next/router";
import { LocaleId, TextDirection } from "../types";

const RTL_LANGS = new Set<string>(["he", "ar"]);
class LocaleContextImpl implements ILocaleContext {
	private _locale: string;
	private _locales: string[];
	private _translate: (s: string, lang?: LocaleId) => string;
	private _router: NextRouter;
	constructor(props: ILocaleContextProps) {
		if (!props) {
			return;
		}
		const { router } = props;
		const { locale, locales } = router;
		this._router = router;
		this._locale = locale;
		this._locales = locales;
		this._translate = _translate(locale, Languages);
	}

	public textDirection(locale?: string): TextDirection {
		locale = locale || this._locale;
		return RTL_LANGS.has(locale) ? "rtl" : "ltr";
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

	public getLocaleLabel = (id: string) =>
		[localeLabelPrefix, id].join("_").toUpperCase();

	public getLocaleSymbol = (id: string) =>
		this.translate(this.getLocaleLabel(id));

	public translate = (key: string, lang?: LocaleId) =>
		this._translate(key, lang);

	public setLocale = (locale: LocaleId) =>
		this.router.push(this.asPath, this.asPath, {
			locale,
			scroll: true,
		});
}

const ctx = createContext<ILocaleContext>(new LocaleContextImpl(null));

export const LocaleContext: Context<ILocaleContext> = ctx;

export const LocaleContextProvider = ({ children, router }) => {
	return (
		<LocaleContext.Provider value={new LocaleContextImpl({ router })}>
			{children}
		</LocaleContext.Provider>
	);
};
