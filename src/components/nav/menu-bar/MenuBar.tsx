import React, { useContext } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { getIcon } from "@components/icons";
import ListItem from "@components/list-item/ListItem";
import Button from "@components/button/Button";
import List from "@components/list/List";
import NavItem from "../nav-item/NavItem";
import type { INavSection } from "@src/types/nav";
import { LocaleContext } from "@contexts/index";
import type { TextDirection } from "@src/types/locale";
import type { YASPP } from "yaspp-types";
import ComponentContextProvider from "@contexts/componentContext";
import useClassNames, { IClassNamesInfo } from "@hooks/useClassNames";
import type { ComponentPath, YSPComponentPropsWithChildren } from "@src/types/components";

import styles from "./MenuBar.module.scss";

interface NavProps {
	readonly items: ReadonlyArray<INavSection>;
	readonly textDirection?: TextDirection;
};

const renderItems = (items: ReadonlyArray<YASPP.INavItemData>, currentPath: ComponentPath) =>
	items.map((item) => (
		<NavigationMenu.Link asChild key={item.id}>
			<ListItem className={styles.menuListItem} currentPath={currentPath}>
				<NavItem
					{...item}
					title={item.title}
					description={item.locale.description}
					author={item.locale.author}
					icon={item.icon}
				/>
			</ListItem>
		</NavigationMenu.Link>
	));

const renderSections = (sections: ReadonlyArray<INavSection>, classInfo: IClassNamesInfo) => {
	const { createSubPath } = classInfo;
	const mainItemPath = createSubPath("main-menu.item");
	const menuPath = createSubPath("submenu");
	const subItemPath = createSubPath("submenu.item")
	return sections.map((section) => (
		<NavigationMenu.Item key={section.id} asChild>
			<ListItem
				currentPath={mainItemPath}
				className={styles.menuSectionTriggerItem}
				key={`list-item-${section.id}`}
			>
					<Button asChild currentPath={mainItemPath}>
						<NavigationMenu.Trigger data-state="open">
							{section.title}
							{getIcon("caretDown", { className: styles.caret })}
						</NavigationMenu.Trigger>
					</Button>
					<NavigationMenu.Content className={styles.content}>
						<List className={styles.sectionItemsList} currentPath={menuPath}>
							{renderItems(section.items, subItemPath)}
						</List>
					</NavigationMenu.Content>
			</ListItem>
		</NavigationMenu.Item>
	));
};

const MenuBar = ({ items, textDirection, className, currentPath }: YSPComponentPropsWithChildren<NavProps>) => {
	const locale = useContext(LocaleContext);
	const classInfo = useClassNames({
		classes: [styles.root, className],
		part: "site-horizontal-menu",
		currentPath
	});
	const { componentClass, componentPath } = classInfo;

	// site-horizontal-menu
	return <ComponentContextProvider parentPath={componentPath}>
		<NavigationMenu.Root
			className={componentClass}
			data-direction={textDirection || locale.getTextDirection}
		>
			<NavigationMenu.List className={styles.menuSectionTriggers}>
				{renderSections(items, classInfo)}
				<NavigationMenu.Indicator className={styles.indicator}>
					<div className={styles.arrow}></div>
				</NavigationMenu.Indicator>
			</NavigationMenu.List>
			<div className={styles.viewportPosition}>
				<NavigationMenu.Viewport className={styles.viewport} />
			</div>
		</NavigationMenu.Root>
	</ComponentContextProvider>
}

export default MenuBar;
