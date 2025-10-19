import type { NextRouter } from "next/router";
import type { LocaleId } from "../types";
import type { Translate } from "next-translate";
import { LocalizeFunction } from "@lib/locale";
// import type { ILocaleMetaContext } from "../contexts/locale-meta-context";
// import type { ILocalePageContext } from "../contexts/locale-page-context";

export interface ILocaleContext {
	readonly locale: string;
	readonly locales: ReadonlyArray<string>;
	readonly textDirection: TextDirection;
	setLocale: (id: LocaleId) => Promise<boolean>;
	getTextDirection: (locale?: string) => TextDirection;
	/**
	 * Next translate function
	 */
	t: Translate;
	/**
	 * Translate one string. Supports embedded keys [[ns:key:list:...]] and next-translate value dictonary
	 */
	translate: LocalizeFunction;
}

export interface ILocaleContextProps {
	readonly router: NextRouter;
	readonly locale: LocaleId;
	readonly translate: Translate;
}

export type TextDirection = "rtl" | "ltr";

export type Direction = "right" | "left";

// export interface ILocaleInfo {
// 	readonly direction: TextDirection;
// }

export const localeLabelPrefix = "LOCALE_LABEL";
