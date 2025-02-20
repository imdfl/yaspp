import {
	INavItemData,
	NavItemLocaleProps,
	INavSection,
	INavSectionData,
} from 'types/nav';

const translateKeys = (
	keys: NavItemLocaleProps,
	translateFn: (s: string) => string
) =>
	Object.fromEntries(
		Object.keys(keys).map((key) => [key, translateFn(keys[key])])
	);

const getSectionItems = (
	section: INavSectionData,
	items: INavItemData[]
) => {
	return section.items
		? section.items.map(
				(itemId) => items.filter((item) => item.id === itemId)[0]
		  )
		: null;
};

export const parseMenuItems = (
	sections: INavSectionData[],
	items: INavItemData[],
	translate: (s: string) => string
): INavSection[] => {
	const res = sections.map((section) => {
		return Object.assign({}, section, {
			title: translate(section.title),
			locale: translateKeys(section.locale, translate),
			items: getSectionItems(section, items).map((item) => {
				return Object.assign({}, item, {
					title: translate(item.title),
					locale: translateKeys(item.locale, translate),
				});
			}),
		});
	});
	return res;
};
