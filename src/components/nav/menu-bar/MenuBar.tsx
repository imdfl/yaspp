import { createRef, RefObject, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import type { INavSection } from "@src/types/nav";
import type { TextDirection } from "@src/types/locale";
import type { YASPP } from "yaspp-types";
import type { IClassNamesInfo } from "@hooks/useClassNames";
import type { ComponentPath, IComponentPath, YSPComponentPropsWithChildren } from "@src/types/components";

import { getIcon } from "@components/icons";
import ListItem from "@components/list-item/ListItem";
import Button from "@components/button/Button";
import List from "@components/list/List";
import NavItem from "../nav-item/NavItem";
import { LocaleContext } from "@contexts/index";
import ComponentContextProvider from "@contexts/componentContext";
import useClassNames from "@hooks/useClassNames";
import cx from "@lib/class-names";

import styles from "./MenuBar.module.scss";
import { createClickOutsideMonitor } from "../../../lib/browser/detect-click-outside";

interface NavProps {
	readonly items: ReadonlyArray<INavSection>;
	readonly textDirection?: TextDirection;
};

type MenuItemRef = RefObject<HTMLElement | HTMLDivElement | HTMLLIElement>;

const renderItems = (items: ReadonlyArray<YASPP.INavItemData>, currentPath: IComponentPath) => {
	const cp = currentPath.asString;
	return items.map((item) => (
		// <NavigationMenu.Link asChild key={item.id}>
		<ListItem className={styles.menuListItem} currentPath={cp} key={item.id}>
			<NavItem
				{...item}
				title={item.title}
				description={item.locale.description}
				author={item.locale.author}
				icon={item.icon}
			/>
		</ListItem>
		// </NavigationMenu.Link>
	));
};

const renderSections = (options: {
	refs: Map<string, MenuItemRef>,
	selectedId: string, toggleSelectedId: (s: string) => unknown,
	sections: ReadonlyArray<INavSection>, classInfo: IClassNamesInfo
}) => {
	const { sections, classInfo, selectedId, toggleSelectedId, refs } = options;
	const { componentPath, createSubClass } = classInfo;
	const mainItemPath = componentPath.add("main-menu.item");
	const menuPath = componentPath.add("submenu");
	const subItemPath = componentPath.add("submenu.item")
	const contentClass = createSubClass("submenu.content", styles.content)
	return sections.map((section) => (
		// <NavigationMenu.Item key={section.id} asChild>
		<ListItem
			ref={refs.get(section.id) as any}
			currentPath={mainItemPath.asString}
			className={cx(styles.menuSectionTriggerItem, {
				[styles.open]: section.id === selectedId
			})}
			key={section.id}
		>
			{/* <> */}
			<Button currentPath={mainItemPath.asString} onClick={() => toggleSelectedId(section.id)}>
				{/* <NavigationMenu.Trigger data-state="open"> */}
				{section.title}
				{getIcon("caretDown", { className: styles.caret })}
				{/* </NavigationMenu.Trigger> */}
			</Button>
			<div className={contentClass}>
				<List className={styles.sectionItemsList} currentPath={menuPath.asString}>
					{renderItems(section.items, subItemPath)}
				</List>
			</div>
			{/* </> */}
		</ListItem>
		// </NavigationMenu.Item>
	));
};

const MenuBar = ({ items, textDirection, className, currentPath }: YSPComponentPropsWithChildren<NavProps>) => {
	const locale = useContext(LocaleContext);
	const [selectedId, setSelectedId] = useState("");
	const classInfo = useClassNames({
		classes: [styles.root, className],
		part: "site-horizontal-menu",
		currentPath
	});
	const { componentClass, componentPath } = classInfo;
	const menuRefs = useMemo(() => {
		const refs = items.map(i => [i.id, createRef<HTMLElement | HTMLDivElement>()] as const);
		return new Map<string, MenuItemRef>(refs);
	}, [items]);

	const clickMonitor = useMemo(() => {
		const callback = () => {
			setSelectedId("");
		}
		return createClickOutsideMonitor({ callback });
	}, [])

	const toggleSelectedId = useCallback((id: string) => {
		const selected = id === selectedId ? "" : id;
		setSelectedId(selected);
	}, [selectedId]);


	useEffect(() => {
		clickMonitor?.clear();
		if (selectedId) {
			const el = menuRefs.get(selectedId).current;
			if (el) {
				clickMonitor.addTargets(el);
			}

		}
		return () => {
			clickMonitor?.clear();
		}
	}, [selectedId, clickMonitor])

	// site-horizontal-menu
	return <ComponentContextProvider parentPath={componentPath}>
		<div
			className={componentClass}
			data-direction={textDirection || locale.getTextDirection}
		>
			<ul className={styles.menuSectionTriggers}>
				{renderSections({ sections: items, classInfo, selectedId, toggleSelectedId, refs: menuRefs })}
				{/* <NavigationMenu.Indicator className={styles.indicator}>
					<div className={styles.arrow}></div>
				</NavigationMenu.Indicator> */}
			</ul>
			{/* <div className={styles.viewportPosition}>
				<NavigationMenu.Viewport className={styles.viewport} />
			</div> */}
		</div>
	</ComponentContextProvider>
}

export default MenuBar;
