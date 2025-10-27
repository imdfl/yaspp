import type { LocaleDictionary, LocaleId } from "./locale";
import type { INavGroupData, INavItemData, INavSectionData, NavGroups } from "./nav";
import type { YASPP } from "yaspp-types";
import { IYasppClassTree } from "./styles";
/**
 * App object that contains data about the current build
 */

export interface IStylesheetUrl {
	readonly base: string;
	readonly full: string;
}
export interface IYasppApp {
	/**
	 * The full path of the content folder
	 */
	readonly contentPath: string;
	/**
	 * The relative (to the content path) path of the index page
	 */
	readonly indexPath: string;
	/**
	 * True if this app was initialized successfully and found all its paths
	 */
	readonly isValid: boolean;

	/**
	 * if the app is not valid, this is the error encountered
	 */
	readonly error: string;

	/**
	 * Map of locale id (e.g. "en") to a map of namespace => key:value
	 */
	readonly dictionary: LocaleDictionary;

	/**
	 * Default locale to start with and use as fallback in translations
	 */
	readonly defaultLocale: LocaleId;

	readonly nav: NavGroups;

	readonly styleClassBindings: ReadonlyArray<IYasppClassTree>;

	readonly styleUrls: ReadonlyArray<IStylesheetUrl>;
}

/**
 * Display ready navigation data (before localization)
 */
export interface IYasppNavData {
	readonly items: Record<string, Omit<INavItemData, "id">>;
	readonly sections: Record<string, Omit<INavSectionData, "id">>;
	readonly groups: Record<string, INavGroupData>;
}

export interface IYasppAppConfig extends YASPP.IYasppConfig {
	/**
	 * Relative to yaspp root
	 */
	readonly root: string;
}
