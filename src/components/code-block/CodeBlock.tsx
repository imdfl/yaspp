import React from "react";
import classNames from "@lib/class-names";
import styles from "./CodeBlock.module.scss";
import type { YSPComponentPropsWithChildren } from "@src/types/components";
import useClassNames from "../../hooks/useClassNames";

const CodeBlock = ({
	children,
	className,
}: YSPComponentPropsWithChildren): React.JSX.Element => {
	const { componentClass } = useClassNames({
		part: "code-block",
		classes: [styles.root, className]
	})
	return (
		<div className={componentClass}>
			<pre className={styles.pre}>
				<code className={styles.code}>{children}</code>
			</pre>
		</div>
	);
};

export default CodeBlock;
