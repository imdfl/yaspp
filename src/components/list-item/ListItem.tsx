import React, { forwardRef } from "react";
import styles from "./ListItem.module.scss";
import type { LinkTargetProps } from "../link/Link";
import ComponentContextProvider from "@contexts/componentContext";
import useClassNames from "@hooks/useClassNames";
import { YSPComponentPropsWithChildren } from "types/components";

type ListItemProps = {
	label?: string;
	url?: string;
	target?: LinkTargetProps;
};

const ListItem = forwardRef<HTMLLIElement, YSPComponentPropsWithChildren<ListItemProps>>(
	({ children, className, ...rest }: YSPComponentPropsWithChildren<ListItemProps>, ref) => {
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
