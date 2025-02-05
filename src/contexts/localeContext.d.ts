import { NextRouter } from "next/router";
import { LocaleId } from "../types";
// import type { ILocaleMetaContext } from "../contexts/locale-meta-context";
// import type { ILocalePageContext } from "../contexts/locale-page-context";

export interface ILocaleContext {
	readonly locale: string;
	readonly locales: string[];
	// readonly textDirection: TextDirection;
	// readonly meta: ILocaleMetaContext;
	// readonly pages: ILocalePageContext;
	// translate: (s: string, lang?: string) => string;
	// getLocaleSymbol: (id: string) => string;
	getLocaleLabel: (id: string) => string;
	setLocale: (id: LocaleId) => Promise<boolean>;
	textDirection: (locale?: string) => TextDirection;
	// siteTitle: string;
	// siteSubtitle: string;
	// pageName: string;
	// sectionName: string;
}

export interface ILocaleContextProps {
	readonly router: NextRouter;
}

export type TextDirection = "rtl" | "ltr";

export type Direction = "right" | "left";

// export interface ILocaleInfo {
// 	readonly direction: TextDirection;
// }

export const localeLabelPrefix = "LOCALE_LABEL";
