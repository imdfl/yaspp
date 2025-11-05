import React from "react";
import styles from "./Term.module.scss";
import classNames from "@lib/class-names";
import type { YSPComponentPropsWithChildren } from "types/components";


export const Term = ({
	children,
	className,
}: YSPComponentPropsWithChildren): JSX.Element => (
	<span className={classNames(styles.root, className)}>
		<dfn className={styles.label}>{children}</dfn>
	</span>
);

export default Term;
