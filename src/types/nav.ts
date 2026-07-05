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
	readonly id: string;
	readonly locale: Record<string, string>;
	readonly items: ReadonlyArray<YASPP.INavItemData>;
	readonly title: string;
};

/**
 * The entire site navigation map, maps a navigation group e.g. "sidebar" to its sections
 */
export type NavGroups = Record<string, ReadonlyArray<INavSection>>;