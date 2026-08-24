import React from "react";
import type { LinkTargetProps } from "@components/link/Link";
import { ComponentContextProvider } from "@contexts";
import useClassNames from "@hooks/useClassNames";
import { YSPComponentPropsWithChildren } from "@src/types/components";

import styles from "./ListItem.module.scss";

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
