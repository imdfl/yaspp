import { YASPP } from "yaspp-types";

export type NavItemLocaleProps = Record<string, string>;

export enum NavSectionId {
	TOPBAR = 'topbar',
	SIDEBAR = 'sidebar',
	FOOTER = 'footer',
}

/**
 * Represents the full data of a single section in a navigation list
 */
export interface INavSection {
	id: string;
	locale: Record<string, string>;
	items: ReadonlyArray<YASPP.INavItemData>;
	title: string;
};

/**
 * The entire site navigation map, maps a navigation group e.g. "sidebar" to its sections
 */
export type NavGroups = Record<string, ReadonlyArray<INavSection>>;