import React from "react";
import styles from "./Blockquote.module.scss";
import classNames from "@lib/class-names";
import type { YSPComponentPropsWithChildren } from "types/components";


const Blockquote = ({
	children,
	className,
}: YSPComponentPropsWithChildren): JSX.Element => (
	<blockquote
		className={classNames(styles.root, className)}
	>
		{children}
	</blockquote>
);

export default Blockquote;
