import type { NextRouter } from "next/router";
import type { LocaleId } from "../types";
import type { Translate } from "next-translate";
import { LocalizeFunction } from "@lib/locale";

export type MaybeTranslate = (key: string) => string;

export interface ILocaleContext {
	readonly locale: string;
	readonly locales: ReadonlyArray<string>;
	readonly allowedLocales: readonly string[];
	readonly textDirection: TextDirection;
	setLocale: (id: LocaleId) => Promise<boolean>;
	getTextDirection: (locale?: string) => TextDirection;
	/**
	 * Next translate function
	 */
	t: Translate;
	/**
	 * Calls Next translate function, returns empty string if not found
	 */
	tryTranslate: MaybeTranslate;
	/**
	 * Translate one string. Supports embedded keys [[ns:key:list:...]] and next-translate value dictonary
	 */
	translate: LocalizeFunction;
}

export interface ILocaleContextProps {
	readonly router: NextRouter;
	readonly locale: LocaleId;
	readonly translate: Translate;
	readonly allowedLocales: readonly string[];
}

export type TextDirection = "rtl" | "ltr";

export type Direction = "right" | "left";

// export interface ILocaleInfo {
// 	readonly direction: TextDirection;
// }

export const localeLabelPrefix = "LOCALE_LABEL";
