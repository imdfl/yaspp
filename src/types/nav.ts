
export type NavItemLocaleProps = Record<string, string>;

export enum NavSectionId {
	TOPBAR = 'topbar',
	SIDEBAR = 'sidebar',
	FOOTER = 'footer',
}

export interface INavItemData {
	id: string;
	type: string;
	title: string;
	url: string;
	locale: NavItemLocaleProps;
	icon?: string;
	target?: string;
};

export interface INavSectionData {
	id: string;
	locale: NavItemLocaleProps;
	items: ReadonlyArray<string>;
	title: string;
};

export interface INavGroupData {
	items: ReadonlyArray<string>;
}

/**
 * Represents the full data of a single section in a navigation list
 */
export interface INavSection {
	id: string;
	locale: Record<string, string>;
	items: ReadonlyArray<INavItemData>;
	title: string;
};

/**
 * The entire site navigation map, maps a navigation group e.g. "sidebar" to its sections
 */
export type NavGroups = Record<string, ReadonlyArray<INavSection>>;