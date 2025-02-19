import { default as menuSectionData } from './sections.json' assert { type: 'json' };
import { default as menuItemsData } from './items.json' assert { type: 'json' };
import type {
	INavItemDataProps,
	INavSectionDataProps,
} from 'types/nav';

export enum NavSectionId {
	TOPBAR = 'topbar',
	SIDEBAR = 'sidebar',
	FOOTER = 'footer',
}

type LayoutConfig = {
	menuSectionData: Record<NavSectionId, INavSectionDataProps[]>;
	menuItemsData: INavItemDataProps[];
};

const config: LayoutConfig = {
	menuSectionData,
	menuItemsData,
};

export default config;
