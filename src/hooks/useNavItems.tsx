import { useContext, useEffect, useState } from "react";
import type { YASPP } from "yaspp-types";
import { PageContext } from "../contexts/pageContext";
import { LocaleContext } from "../contexts/localeContext";
import type  { LocalizeFunction } from "../lib/locale";
import type { INavSection } from "../types/nav";

export interface INavItemsData {
	sections: ReadonlyArray<INavSection>;
}

function translateRecord(rec: Record<string, string>, translate: LocalizeFunction): Record<string, string> {
	return Object.entries(rec || {}).reduce((rec, [key, value]) => {
		rec[key] = translate(value);
		return rec;
	}, {} as Record<string, string>)
}

function translateItem(item: YASPP.INavItemData, translate: LocalizeFunction): YASPP.INavItemData {
	return {
		...item,
		title: translate(item.title),
		locale: translateRecord(item.locale, translate)
	}
}

function translateSection(section: INavSection, translate: LocalizeFunction): INavSection {
	return  {
		id: section.id,
		items: section.items.map(item => translateItem(item, translate)),
		locale: translateRecord(section.locale, translate),
		title: translate(section.title)
	};
}
/**
 * Returns an object with (possibly cached) parsed page data and parsed metaData (embedded in pages)
 *
 * Guaranteed not null
 * @param props
 * @returns
 */
export const useNavItems = (
	groupName: string
): INavItemsData => {
	const { navigationGroups } = useContext(PageContext);
	const { translate } = useContext(LocaleContext);
	const [sections, setSections] = useState<INavSection[]>([]);
	// If the props changed, due to locale change, reparse the content
	useEffect(() => {
		const sects = navigationGroups.get(groupName) ?? [];
		setSections(sects.map(s => translateSection(s, translate)));
	}, [navigationGroups, groupName, translate]);

	return {
		sections
	};
};

export default useNavItems;
