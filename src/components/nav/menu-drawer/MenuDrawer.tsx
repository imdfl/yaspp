import React from "react";
import NavItem from "../nav-item/NavItem";
import List from "../../list/List";
import ListItem from "../../list-item/ListItem";
import styles from "./MenuDrawer.module.scss";
import type { INavSection } from "types/nav";
import ComponentContextProvider from "@contexts/componentContext";
import useClassNames from "@hooks/useClassNames";

type VerticalNavProps = {
	items: ReadonlyArray<INavSection>;
	onClose?: () => void;
	className?: string;
};

const MenuDrawer = ({ items, onClose, className }: VerticalNavProps) => {
	const { componentClass, componentPath } = useClassNames({
		classes: [styles.root, className],
		part: "menu-drawer",
	});
	// return (
	// 	<ComponentContextProvider parentPath={componentPath}>
	return (
		<ComponentContextProvider parentPath={componentPath}>
			<div className={componentClass}>
				{items.map((section) => (
					<span key={section.id}>
						<div className={styles.sectionTitle}>{section.title}</div>
						<List className={styles.list}>
							{section.items.map((item) => (
								<ListItem key={item.id} className={styles.listItem}>
									<NavItem
										{...item}
										onClick={onClose}
										// key={`nav-item-${item.id}`}
										title={item.title}
										description={item.locale.description}
										author={item.locale.author}
										icon={undefined}
									/>
								</ListItem>
							))}
						</List>
					</span>
				))}
			</div>
		</ComponentContextProvider>
	);
}

export default MenuDrawer;
export type { VerticalNavProps };
