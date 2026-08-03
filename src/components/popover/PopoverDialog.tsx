import { useContext } from "react";
import classNames from "@lib/class-names";
import type { YSPComponentPropsWithChildren } from "@src/types/components";
import { LocaleContext } from "@contexts/index";

import styles from "./PopoverDialog.module.scss";


const PopoverDialog = ({
	className,
	children,
}: YSPComponentPropsWithChildren) => {
	const { textDirection } = useContext(LocaleContext);
	return <div className={classNames(styles.root, className)} dir={textDirection}>{children}</div>;
};

export default PopoverDialog;
