import React from "react";
import styles from "./ListItem.module.scss";
import type { LinkTargetProps } from "../link/Link";
import ComponentContextProvider from "@contexts/componentContext";
import useClassNames from "@hooks/useClassNames";
import { YSPComponentPropsWithChildren } from "@src/types/components";

type ListItemProps = {
	label?: string;
	url?: string;
	target?: LinkTargetProps;
};

const ListItem = (
    {
        // ref,
        children,
        className,
        currentPath,
        ...rest
    }: YSPComponentPropsWithChildren<ListItemProps> & {
        ref?: React.RefObject<HTMLLIElement>;
    }
) => {
    const { componentClass, componentPath, attributes } = useClassNames({
        classes: [styles.root, className],
        currentPath,
        part: "list-item",
    });
    return (
        <ComponentContextProvider parentPath={componentPath}>
            <li className={componentClass} {...rest} {...attributes}>
                {children}
            </li>
        </ComponentContextProvider>
    )
};

ListItem.displayName = "ListItem";

export default ListItem;
export type { ListItemProps };
