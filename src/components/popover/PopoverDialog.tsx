import React from "react";
import styles from "./PopoverDialog.module.scss";
import classNames from "@lib/class-names";
import type { YSPComponentPropsWithChildren } from "types/components";
// import useClassNames from "@hooks/useClassNames";
// import ComponentContextProvider from "@contexts/componentContext";


const PopoverDialog = ({
	className,
	children,
}: YSPComponentPropsWithChildren) => {
	return <div className={classNames(styles.root, className)}>{children}</div>;
};

export default PopoverDialog;
