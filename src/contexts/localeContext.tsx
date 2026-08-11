import { Context, createContext, PropsWithChildren } from "react";
import useTranslation from "next-translate/useTranslation";
import type {
	ILocaleContext,
	ILocaleContextProps,
	MaybeTranslate,
} from "./localeContext.d";

import { NextRouter, Router } from "next/router";
import type { LocaleId, TextDirection } from "../types";
import { Translate } from "next-translate";
import { isRTL, LocalizeFunction, localizeString } from "@lib/locale";

interface CoreLocaleContextOptions {
	readonly initialLocale: string;
	readonly router: Router;
	readonly allowedLocales?: readonly string[];

}

export type LocaleContextOptions = PropsWithChildren<CoreLocaleContextOptions>;

class LocaleContextImpl implements ILocaleContext {
	private _locale: string;
	private _locales: ReadonlyArray<string>;
	// private _translate: (s: string, lang?: LocaleId) => string;
	private readonly _router: NextRouter;
	private readonly _t: Translate;
	private readonly _translate: LocalizeFunction;
	private readonly _allowedLocales: string[];
	public readonly tryTranslate: MaybeTranslate; 
	constructor(props: ILocaleContextProps) {
		if (!props) {
			return;
		}
		const { router, translate } = props;
		this._t = translate;
		this._translate = (s, arg) => localizeString(s, translate, arg);
		this.tryTranslate = (key: string) => translate(key, null, {
			"default": ""
		});

		this._router = router;
		this._locale = props.locale;
		this._locales = router.locales;
		this._allowedLocales = props.allowedLocales?.slice() ?? [];
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

	public get allowedLocales() {
		return this._allowedLocales.length ? this._allowedLocales : this._locales;
	}

	// public getLocaleLabel = (id: string) =>
	// 	[localeLabelPrefix, id].join("_").toUpperCase();

	// public getLocaleSymbol = (id: string) =>
	// 	this.translate(this.getLocaleLabel(id));

	// public translate = (key: string, lang?: LocaleId) =>
	// 	this._translate(key, lang);

	public async setLocale(locale: LocaleId) {
		if (this._allowedLocales.length && !this._allowedLocales.includes(locale)) {
			console.warn(`Cannot navigate this page to locale ${locale}`);
			return false;
		}
		return this.router.push(this.asPath, this.asPath, {
			locale,
			scroll: true,
		});
	}
}

const ctx = createContext<ILocaleContext>(new LocaleContextImpl(null));

export const LocaleContext: Context<ILocaleContext> = ctx;

export const LocaleContextProvider = ({ children, router, initialLocale, allowedLocales }: LocaleContextOptions) => {
	const ut = useTranslation();
	const { t, lang } = ut;
	return (
        (<LocaleContext value={new LocaleContextImpl({ router, locale: lang, translate: t, allowedLocales })}>
            {children}
        </LocaleContext>)
    );
};
