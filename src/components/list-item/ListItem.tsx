import React, { forwardRef, PropsWithChildren } from "react";
import styles from "./ListItem.module.scss";
import type { LinkTargetProps } from "../link/Link";
import ComponentContextProvider from "@contexts/componentContext";
import useClassNames from "@hooks/useClassNames";

type ListItemProps = {
	label?: string;
	url?: string;
	target?: LinkTargetProps;
	className?: string;
};

const ListItem = forwardRef<HTMLLIElement, PropsWithChildren<ListItemProps>>(
	({ children, className, ...rest }: PropsWithChildren<ListItemProps>, ref) => {
		const { componentClass, componentPath } = useClassNames({
			classes: [styles.root, className],
			part: "list-item",
		});
		return (
			<ComponentContextProvider parentPath={componentPath}>
				<li ref={ref} className={componentClass} {...rest}>
					{children}
				</li>
			</ComponentContextProvider>
		)
	}
);

ListItem.displayName = "ListItem";

export default ListItem;
export type { ListItemProps };
