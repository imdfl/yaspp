
export type NavItemLocaleProps = Record<string, string>;

export interface INavItemDataProps {
	id: string;
	type: string;
	title: string;
	url: string;
	locale: NavItemLocaleProps;
	icon?: string;
	target?: string;
};

export interface INavSectionDataProps {
	id: string;
	locale: NavItemLocaleProps;
	items: string[];
	title: string;
};

/**
 * Represents the full data of a single section in a navigation list
 */
export interface INavSection {
	id: string;
	locale: Record<string, string>;
	items: INavItemDataProps[];
	title: string;
};
