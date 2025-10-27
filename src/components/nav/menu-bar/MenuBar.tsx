import React, { useContext } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { getIcon } from "../../icons";
import ListItem from "../../list-item/ListItem";
import Button from "../../button/Button";
import List from "../../list/List";
import NavItem from "../nav-item/NavItem";
import styles from "./MenuBar.module.scss";
import type { INavSection } from "types/nav";
import { LocaleContext } from "@contexts/localeContext";
import type { TextDirection } from "types/locale";
import type { YASPP } from "yaspp-types";
import ComponentContextProvider from "@contexts/componentContext";
import useClassNames from "@hooks/useClassNames";

type NavProps = {
	items: ReadonlyArray<INavSection>;
	className?: string;
	textDirection?: TextDirection;
};

const renderItems = (items: ReadonlyArray<YASPP.INavItemData>) =>
	items.map((item) => (
		<NavigationMenu.Link asChild key={item.id}>
			<ListItem className={styles.menuListItem}>
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

const renderSections = (sections: ReadonlyArray<INavSection>) =>
	sections.map((section) => (
		<NavigationMenu.Item key={section.id} asChild>
			<ListItem
				className={styles.menuSectionTriggerItem}
				key={`list-item-${section.id}`}
			>
				<>
					<Button className={styles.menuSectionTriggerButton} asChild>
						<NavigationMenu.Trigger>
							{section.title}
							{getIcon("caretDown", styles.caret)}
						</NavigationMenu.Trigger>
					</Button>
					<NavigationMenu.Content className={styles.content}>
						<List className={styles.sectionItemsList}>
							{renderItems(section.items)}
						</List>
					</NavigationMenu.Content>
				</>
			</ListItem>
		</NavigationMenu.Item>
	));

const MenuBar = ({ items, textDirection, className }: NavProps) => {
	const locale = useContext(LocaleContext);
	const { componentClass, componentPath } = useClassNames({
		classes: [styles.root, className],
		part: "site-horizontal-menu",
	});
	// site-horizontal-menu
	return <ComponentContextProvider parentPath={componentPath}>
		<NavigationMenu.Root
			className={componentClass}
			data-direction={textDirection || locale.getTextDirection}
		>
			<NavigationMenu.List className={styles.menuSectionTriggers}>
				{renderSections(items)}
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
