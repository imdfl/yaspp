import React from "react";
import classNames from "@lib/class-names";
import styles from "./CodeBlock.module.scss";
import type { YSPComponentPropsWithChildren } from "types/components";

const CodeBlock = ({
	children,
	className,
}: YSPComponentPropsWithChildren): JSX.Element => (
	<div className={classNames(styles.root, className)}>
		<pre className={styles.pre}>
			<code className={styles.code}>{children}</code>
		</pre>
	</div>
);

export default CodeBlock;
