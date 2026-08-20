import React from "react";
import type { YSPComponentPropsWithChildren } from "@src/types/components";
import useClassNames from "@hooks/useClassNames";

import styles from "./Blockquote.module.scss";


const Blockquote = ({
	children,
	className,
}: YSPComponentPropsWithChildren): React.JSX.Element => {
	const { componentClass } = useClassNames({
		part: "blockquote",
		classes: [styles.root, className]
	})
	return (
		<blockquote className={componentClass}>
			{children}
		</blockquote>
	);
}

export default Blockquote;
