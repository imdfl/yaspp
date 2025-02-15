import React from 'react';
import NavItem from '../nav-item/NavItem';
import List from '../../list/List';
import ListItem from '../../list-item/ListItem';
import classNames from 'classnames';
import styles from './MenuDrawer.module.scss';
import type { NavParsedNodes } from '../types';

type VerticalNavProps = {
	items: NavParsedNodes[];
	onClose?: () => void;
	className?: string;
};

const MenuDrawer = ({ items, onClose, className }: VerticalNavProps) => (
	<div className={classNames(styles.root, className)}>
		{items.map((section) => (
			<span key={section.id}>
				<div className={styles.sectionTitle}>{section.locale.title}</div>
				<List className={styles.list}>
					{section.items.map((item) => (
						<ListItem key={`list-item-${item.id}`} className={styles.listItem}>
							<NavItem
								{...item}
								onClick={onClose}
								// key={`nav-item-${item.id}`}
								title={item.locale.title}
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
);

export default MenuDrawer;
export type { VerticalNavProps };
