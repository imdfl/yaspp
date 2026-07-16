import React, { HTMLAttributes, PropsWithChildren } from "react";
import Link from "../link/Link";
import Text from "../text/Text";
import ListItem, { ListItemProps } from "../list-item/ListItem";
import useClassNames from "../../hooks/useClassNames";
import type { ComponentPath } from "@src/types/components";

import styles from "./List.module.scss";

type ListProps = Readonly<{
	items?: ListItemProps[];
	label?: string;
	ordered?: boolean;
	className?: string;
	currentPath?: ComponentPath;
}>;

const renderListItems = (items: ListItemProps[], componentPath: ComponentPath) =>
	items.map(({ label, target, url }) => {
		return (
			<ListItem key={label} className={styles.item} currentPath={componentPath}>
				{url ? (
					<Link href={url} target={target} className={styles.link} currentPath={componentPath}>
						{label}
					</Link>
				) : (
					label
				)}
			</ListItem>
		);
	});

const List = ({
	items,
	label,
	ordered,
	children,
	className,
	currentPath
}: PropsWithChildren<ListProps> &
	HTMLAttributes<HTMLDivElement>): React.JSX.Element => {
		const { componentClass: contClass } = useClassNames({
			part: "list-container",
			currentPath,
			classes: [styles.root, className]
		});
		const { componentClass: listClass, componentPath: listPath, attributes} = useClassNames({
			part: "list",
			currentPath,
			classes: [styles.list, className]
		});
	const Tag = ordered ? 'ol' : 'ul';
	return (
		<div className={contClass}>
			{label && <Text className={styles.label}>{label}</Text>}
			<Tag className={listClass} {...attributes}>{children || renderListItems(items, listPath)}</Tag>
		</div>
	);
};

export default List;
